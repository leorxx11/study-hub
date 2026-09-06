package com.studyhub.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** 教学配套服务。监听 127.0.0.1 的空闲端口，所有状态属于当前实例。 */
public final class OrderApiServer implements AutoCloseable {
    private static final Pattern PRODUCT_PATH = Pattern.compile("/products/([^/]+)");
    private static final Pattern ORDER_PATH = Pattern.compile("/orders/([^/]+)(?:/(pay|cancel))?");

    private final HttpServer server;
    private final OrderService orders = new OrderService();
    private final AuthService auth = new AuthService();
    private final JsonMapper json = JsonMapper.builder()
            // 接口要求 JSON 字段类型准确，quantity 必须是整数。
            .disable(DeserializationFeature.ACCEPT_FLOAT_AS_INT)
            .disable(MapperFeature.ALLOW_COERCION_OF_SCALARS)
            .enable(DeserializationFeature.FAIL_ON_TRAILING_TOKENS)
            .build();

    private OrderApiServer() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/", this::handle);
    }

    public static OrderApiServer start() throws IOException {
        OrderApiServer application = new OrderApiServer();
        application.server.start();
        return application;
    }

    public String baseUri() {
        return "http://127.0.0.1:" + server.getAddress().getPort();
    }

    @Override
    public void close() {
        server.stop(0);
    }

    public static void main(String[] args) throws IOException {
        OrderApiServer application = start();
        Runtime.getRuntime().addShutdownHook(new Thread(application::close));
        System.out.println("Order API: " + application.baseUri());
    }

    private void handle(HttpExchange exchange) throws IOException {
        try (exchange) {
            try {
                route(exchange);
            } catch (ApiException exception) {
                if (exception.statusCode() == 401) {
                    exchange.getResponseHeaders().set("WWW-Authenticate", "Bearer");
                }
                sendJson(exchange, exception.statusCode(),
                        Map.of("code", exception.code(), "message", exception.getMessage()));
            }
        }
    }

    private void route(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();
        if (path.equals("/products")) {
            requireMethod(exchange, "GET");
            sendJson(exchange, 200, collection(orders.listProducts(queryParam(exchange, "category"))));
            return;
        }

        Matcher productPath = PRODUCT_PATH.matcher(path);
        if (productPath.matches()) {
            requireMethod(exchange, "GET");
            sendJson(exchange, 200, orders.getProduct(productPath.group(1)));
            return;
        }

        if (path.equals("/auth/login")) {
            requireMethod(exchange, "POST");
            LoginRequest request = readJson(exchange, LoginRequest.class);
            String token = auth.login(request.username(), request.password());
            sendJson(exchange, 200, Map.of("token", token, "tokenType", "Bearer"));
            return;
        }

        if (path.equals("/orders")) {
            requireMethod(exchange, "GET", "POST");
            auth.requireToken(exchange.getRequestHeaders().getFirst("Authorization"));
            if (exchange.getRequestMethod().equals("GET")) {
                sendJson(exchange, 200, collection(orders.listOrders(queryParam(exchange, "status"))));
            } else {
                CreateOrderRequest request = readJson(exchange, CreateOrderRequest.class);
                Order order = orders.createOrder(request.productId(), request.quantity());
                exchange.getResponseHeaders().set("Location", "/orders/" + order.id());
                sendJson(exchange, 201, order);
            }
            return;
        }

        Matcher orderPath = ORDER_PATH.matcher(path);
        if (orderPath.matches()) {
            String action = orderPath.group(2);
            requireMethod(exchange, action == null ? "GET" : "POST");
            auth.requireToken(exchange.getRequestHeaders().getFirst("Authorization"));
            String orderId = orderPath.group(1);
            Order order;
            if (action == null) {
                order = orders.getOrder(orderId);
            } else if (action.equals("pay")) {
                order = orders.pay(orderId);
            } else {
                order = orders.cancel(orderId);
            }
            sendJson(exchange, 200, order);
            return;
        }

        throw new ApiException(404, "ROUTE_NOT_FOUND", "Route not found");
    }

    private void requireMethod(HttpExchange exchange, String... allowedMethods) {
        if (!List.of(allowedMethods).contains(exchange.getRequestMethod())) {
            exchange.getResponseHeaders().set("Allow", String.join(", ", allowedMethods));
            throw new ApiException(405, "METHOD_NOT_ALLOWED", "Method not allowed");
        }
    }

    private <T> T readJson(HttpExchange exchange, Class<T> type) throws IOException {
        String contentType = exchange.getRequestHeaders().getFirst("Content-Type");
        if (contentType == null || !contentType.split(";", 2)[0].trim()
                .equalsIgnoreCase("application/json")) {
            throw new ApiException(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json");
        }
        try {
            T request = json.readValue(exchange.getRequestBody(), type);
            if (request == null) {
                throw new ApiException(400, "INVALID_JSON", "Request body must be a JSON object");
            }
            return request;
        } catch (JsonProcessingException exception) {
            throw new ApiException(400, "INVALID_JSON", "Request body must match the JSON contract");
        }
    }

    private String queryParam(HttpExchange exchange, String name) {
        String query = exchange.getRequestURI().getRawQuery();
        if (query == null) {
            return null;
        }
        for (String parameter : query.split("&")) {
            String[] parts = parameter.split("=", 2);
            if (URLDecoder.decode(parts[0], StandardCharsets.UTF_8).equals(name)) {
                return URLDecoder.decode(parts.length == 2 ? parts[1] : "", StandardCharsets.UTF_8);
            }
        }
        return null;
    }

    private Map<String, Object> collection(List<?> items) {
        return Map.of("items", items, "total", items.size());
    }

    private void sendJson(HttpExchange exchange, int statusCode, Object body) throws IOException {
        byte[] bytes = json.writeValueAsBytes(body);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        exchange.getResponseBody().write(bytes);
    }

    public record LoginRequest(String username, String password) {
    }

    public record CreateOrderRequest(String productId, Integer quantity) {
    }
}
