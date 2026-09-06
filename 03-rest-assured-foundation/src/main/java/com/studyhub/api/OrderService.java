package com.studyhub.api;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** 本阶段的固定商品目录与内存订单；每个实例的订单互相独立。 */
public final class OrderService {
    private final List<Product> products = List.of(
            new Product("PRD-1", "Notebook", "STATIONERY", 1200),
            new Product("PRD-2", "Pen", "STATIONERY", 300),
            new Product("PRD-3", "Backpack", "BAGS", 8800)
    );
    private final Map<String, Order> orders = new LinkedHashMap<>();
    private int nextOrderNumber = 1;

    public List<Product> listProducts(String category) {
        return products.stream()
                .filter(product -> category == null || product.category().equals(category))
                .toList();
    }

    public Product getProduct(String productId) {
        return products.stream()
                .filter(product -> product.id().equals(productId))
                .findFirst()
                .orElseThrow(() -> new ApiException(404, "PRODUCT_NOT_FOUND",
                        "Product not found: " + productId));
    }

    public Order createOrder(String productId, Integer quantity) {
        if (productId == null || productId.isBlank()) {
            throw new ApiException(400, "INVALID_PRODUCT_ID", "productId must not be blank");
        }
        if (quantity == null || quantity < 1 || quantity > 10) {
            throw new ApiException(400, "INVALID_QUANTITY", "quantity must be between 1 and 10");
        }
        Product product = getProduct(productId);
        String orderId = "ORD-" + nextOrderNumber++;
        Order order = new Order(orderId, product, quantity,
                product.unitPriceCents() * quantity, OrderStatus.PENDING);
        orders.put(orderId, order);
        return order;
    }

    public Order getOrder(String orderId) {
        Order order = orders.get(orderId);
        if (order == null) {
            throw new ApiException(404, "ORDER_NOT_FOUND", "Order not found: " + orderId);
        }
        return order;
    }

    public List<Order> listOrders(String status) {
        if (status != null && Arrays.stream(OrderStatus.values())
                .noneMatch(value -> value.name().equals(status))) {
            throw new ApiException(400, "INVALID_STATUS",
                    "status must be PENDING, PAID or CANCELLED");
        }
        return orders.values().stream()
                .filter(order -> status == null || order.status().name().equals(status))
                .toList();
    }

    public Order pay(String orderId) {
        return changeStatus(orderId, OrderStatus.PAID);
    }

    public Order cancel(String orderId) {
        return changeStatus(orderId, OrderStatus.CANCELLED);
    }

    private Order changeStatus(String orderId, OrderStatus nextStatus) {
        Order current = getOrder(orderId);
        if (current.status() != OrderStatus.PENDING) {
            throw new ApiException(409, "ORDER_STATE_CONFLICT",
                    "Only PENDING orders can be paid or cancelled");
        }
        Order updated = new Order(current.id(), current.product(), current.quantity(),
                current.totalAmountCents(), nextStatus);
        orders.put(orderId, updated);
        return updated;
    }
}
