package com.studyhub.api.verification;

import com.studyhub.api.OrderApiServer;
import com.studyhub.api.support.LocalApiTest;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import java.util.List;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.emptyOrNullString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;

/**
 * 【配套服务验收】检查 API_CONTRACT.md 的真实 HTTP 行为，由课程维护者维护。
 * 这是配套服务自测，不是分章阅读示例，也不是学员练习。
 */
public class OrderApiContractTest extends LocalApiTest {

    private RequestSpecification request() {
        return given().baseUri(baseUri);
    }

    private RequestSpecification authorized(String token) {
        return request().auth().oauth2(token);
    }

    private String login() {
        return request()
                .contentType(ContentType.JSON)
                .body(Map.of("username", "student", "password", "study123"))
                .post("/auth/login")
                .then().statusCode(200).contentType(ContentType.JSON)
                .body("tokenType", equalTo("Bearer"))
                .body("token", not(emptyOrNullString()))
                .extract().path("token");
    }

    private String createOrder(String token, String productId, int quantity) {
        return authorized(token)
                .contentType(ContentType.JSON)
                .body(Map.of("productId", productId, "quantity", quantity))
                .post("/orders")
                .then().statusCode(201).contentType(ContentType.JSON)
                .body("status", equalTo("PENDING"))
                .extract().path("id");
    }

    private void assertOrderCount(String token, int expected) {
        authorized(token).get("/orders")
                .then().statusCode(200)
                .body("total", equalTo(expected))
                .body("items", hasSize(expected));
    }

    @Test
    public void shouldListProductsAndFilterByCategory() {
        request().get("/products")
                .then().statusCode(200).contentType(ContentType.JSON)
                .body("total", equalTo(3))
                .body("items.id", contains("PRD-1", "PRD-2", "PRD-3"))
                .body("items.unitPriceCents", contains(1200, 300, 8800));

        request().queryParam("category", "STATIONERY").get("/products")
                .then().statusCode(200)
                .body("total", equalTo(2))
                .body("items.id", contains("PRD-1", "PRD-2"));

        request().queryParam("category", "BAGS").get("/products")
                .then().statusCode(200)
                .body("total", equalTo(1))
                .body("items.name", contains("Backpack"));

        request().queryParam("category", "NO SUCH CATEGORY").get("/products")
                .then().statusCode(200)
                .body("total", equalTo(0)).body("items", hasSize(0));
    }

    @Test
    public void shouldExposeTheFirstChapterProductContract() {
        request().get("/products/PRD-2")
                .then().statusCode(200).contentType(ContentType.JSON)
                .body("id", equalTo("PRD-2"))
                .body("name", equalTo("Pen"))
                .body("category", equalTo("STATIONERY"))
                .body("unitPriceCents", equalTo(300));

        request().get("/products/PRD-404")
                .then().statusCode(404).contentType(ContentType.JSON)
                .body("code", equalTo("PRODUCT_NOT_FOUND"))
                .body("message", equalTo("Product not found: PRD-404"));
    }

    @DataProvider
    public Object[][] invalidCredentials() {
        return new Object[][]{
                {"student", "wrong"},
                {"unknown", "study123"},
                {"", ""}
        };
    }

    @Test(dataProvider = "invalidCredentials")
    public void shouldRejectInvalidCredentials(String username, String password) {
        request().contentType(ContentType.JSON)
                .body(Map.of("username", username, "password", password))
                .post("/auth/login")
                .then().statusCode(401).contentType(ContentType.JSON)
                .header("WWW-Authenticate", equalTo("Bearer"))
                .body("code", equalTo("INVALID_CREDENTIALS"));
    }

    @DataProvider
    public Object[][] protectedEndpoints() {
        return new Object[][]{
                {"GET", "/orders"},
                {"POST", "/orders"},
                {"GET", "/orders/ORD-1"},
                {"POST", "/orders/ORD-1/pay"},
                {"POST", "/orders/ORD-1/cancel"}
        };
    }

    @Test(dataProvider = "protectedEndpoints")
    public void shouldRequireAuthenticationBeforeAccessingOrders(String method, String path) {
        String token = login();
        String orderId = createOrder(token, "PRD-1", 1);

        for (String authorization : List.of("", "Bearer unknown", "Basic student")) {
            RequestSpecification attempt = request();
            if (!authorization.isEmpty()) {
                attempt.header("Authorization", authorization);
            }
            if (method.equals("POST") && path.equals("/orders")) {
                attempt.contentType(ContentType.JSON)
                        .body(Map.of("productId", "PRD-2", "quantity", 1));
            }
            attempt.request(method, path)
                    .then().statusCode(401).contentType(ContentType.JSON)
                    .header("WWW-Authenticate", equalTo("Bearer"))
                    .body("code", equalTo(authorization.isEmpty() ? "AUTH_REQUIRED" : "INVALID_TOKEN"));
        }

        assertOrderCount(token, 1);
        authorized(token).get("/orders/" + orderId)
                .then().statusCode(200).body("status", equalTo("PENDING"));
    }

    @DataProvider
    public Object[][] quantityBoundaries() {
        return new Object[][]{{1, 1200}, {10, 12000}};
    }

    @Test(dataProvider = "quantityBoundaries")
    public void shouldCreateAndReadOrderAtQuantityBoundaries(int quantity, int expectedTotal) {
        String token = login();
        String id = authorized(token).contentType(ContentType.JSON)
                .body(Map.of("productId", "PRD-1", "quantity", quantity))
                .post("/orders")
                .then().statusCode(201)
                .header("Location", equalTo("/orders/ORD-1"))
                .body("id", equalTo("ORD-1"))
                .extract().path("id");

        authorized(token).get("/orders/" + id)
                .then().statusCode(200).contentType(ContentType.JSON)
                .body("product.id", equalTo("PRD-1"))
                .body("product.name", equalTo("Notebook"))
                .body("product.unitPriceCents", equalTo(1200))
                .body("quantity", equalTo(quantity))
                .body("totalAmountCents", equalTo(expectedTotal))
                .body("status", equalTo("PENDING"));
        assertOrderCount(token, 1);
    }

    @DataProvider
    public Object[][] invalidOrders() {
        return new Object[][]{
                {"{\"productId\":\"PRD-1\",\"quantity\":0}", 400, "INVALID_QUANTITY"},
                {"{\"productId\":\"PRD-1\",\"quantity\":-1}", 400, "INVALID_QUANTITY"},
                {"{\"productId\":\"PRD-1\",\"quantity\":11}", 400, "INVALID_QUANTITY"},
                {"{\"productId\":\"PRD-1\",\"quantity\":null}", 400, "INVALID_QUANTITY"},
                {"{\"productId\":\"PRD-1\"}", 400, "INVALID_QUANTITY"},
                {"{\"productId\":\"\",\"quantity\":1}", 400, "INVALID_PRODUCT_ID"},
                {"{\"productId\":\"   \",\"quantity\":1}", 400, "INVALID_PRODUCT_ID"},
                {"{\"productId\":null,\"quantity\":1}", 400, "INVALID_PRODUCT_ID"},
                {"{\"quantity\":1}", 400, "INVALID_PRODUCT_ID"},
                {"{\"productId\":\"PRD-404\",\"quantity\":1}", 404, "PRODUCT_NOT_FOUND"}
        };
    }

    @Test(dataProvider = "invalidOrders")
    public void shouldRejectInvalidOrdersWithoutPersistingThem(String body, int status, String code) {
        String token = login();
        authorized(token).contentType(ContentType.JSON).body(body).post("/orders")
                .then().statusCode(status).contentType(ContentType.JSON)
                .body("code", equalTo(code));
        assertOrderCount(token, 0);

        authorized(token).contentType(ContentType.JSON)
                .body(Map.of("productId", "PRD-2", "quantity", 1)).post("/orders")
                .then().statusCode(201).body("id", equalTo("ORD-1"));
    }

    @DataProvider
    public Object[][] malformedBodies() {
        return new Object[][]{
                {"{"}, {"null"}, {"[]"}, {""},
                {"{\"productId\":\"PRD-1\",\"quantity\":1.5}"},
                {"{\"productId\":\"PRD-1\",\"quantity\":\"2\"}"},
                {"{\"productId\":\"PRD-1\",\"quantity\":true}"},
                {"{\"productId\":\"PRD-1\",\"quantity\":1} {}"}
        };
    }

    @Test(dataProvider = "malformedBodies")
    public void shouldRejectInvalidJsonOrTypes(String body) {
        String token = login();
        authorized(token).contentType(ContentType.JSON).body(body).post("/orders")
                .then().statusCode(400).contentType(ContentType.JSON)
                .body("code", equalTo("INVALID_JSON"));
        assertOrderCount(token, 0);
    }

    @Test
    public void shouldRequireJsonContentType() {
        String token = login();
        authorized(token).contentType(ContentType.TEXT)
                .body("{\"productId\":\"PRD-1\",\"quantity\":1}").post("/orders")
                .then().statusCode(415)
                .body("code", equalTo("UNSUPPORTED_MEDIA_TYPE"));
        assertOrderCount(token, 0);
    }

    @DataProvider
    public Object[][] terminalStates() {
        return new Object[][]{{"pay", "PAID"}, {"cancel", "CANCELLED"}};
    }

    @Test(dataProvider = "terminalStates")
    public void shouldPersistTransitionAndRejectFurtherChanges(String action, String expectedState) {
        String token = login();
        String id = createOrder(token, "PRD-2", 2);

        authorized(token).get("/orders/" + id)
                .then().statusCode(200).body("status", equalTo("PENDING"));
        authorized(token).post("/orders/" + id + "/" + action)
                .then().statusCode(200)
                .body("id", equalTo(id)).body("status", equalTo(expectedState))
                .body("quantity", equalTo(2)).body("totalAmountCents", equalTo(600));

        for (String rejectedAction : List.of("pay", "cancel")) {
            authorized(token).post("/orders/" + id + "/" + rejectedAction)
                    .then().statusCode(409)
                    .body("code", equalTo("ORDER_STATE_CONFLICT"));
            authorized(token).get("/orders/" + id)
                    .then().statusCode(200)
                    .body("status", equalTo(expectedState)).body("totalAmountCents", equalTo(600));
        }
        assertOrderCount(token, 1);
    }

    @DataProvider
    public Object[][] missingOrderEndpoints() {
        return new Object[][]{
                {"GET", "/orders/ORD-404"},
                {"POST", "/orders/ORD-404/pay"},
                {"POST", "/orders/ORD-404/cancel"}
        };
    }

    @Test(dataProvider = "missingOrderEndpoints")
    public void shouldReportMissingOrders(String method, String path) {
        String token = login();
        authorized(token).request(method, path)
                .then().statusCode(404).contentType(ContentType.JSON)
                .body("code", equalTo("ORDER_NOT_FOUND"))
                .body("message", equalTo("Order not found: ORD-404"));
        assertOrderCount(token, 0);
    }

    @Test
    public void shouldFilterOrdersByTheirCurrentStatus() {
        String token = login();
        String pending = createOrder(token, "PRD-1", 1);
        String paid = createOrder(token, "PRD-2", 2);
        String cancelled = createOrder(token, "PRD-3", 1);
        authorized(token).post("/orders/" + paid + "/pay").then().statusCode(200);
        authorized(token).post("/orders/" + cancelled + "/cancel").then().statusCode(200);

        Map<String, String> expectedIds = Map.of("PENDING", pending, "PAID", paid, "CANCELLED", cancelled);
        for (Map.Entry<String, String> entry : expectedIds.entrySet()) {
            authorized(token).queryParam("status", entry.getKey()).get("/orders")
                    .then().statusCode(200).body("total", equalTo(1))
                    .body("items.id", contains(entry.getValue()))
                    .body("items.status", contains(entry.getKey()));
        }
        authorized(token).queryParam("status", "UNKNOWN").get("/orders")
                .then().statusCode(400).body("code", equalTo("INVALID_STATUS"));
        assertOrderCount(token, 3);
    }

    @Test
    public void shouldKeepOrdersAndTokensLocalToEachServer() throws Exception {
        String token = login();
        createOrder(token, "PRD-1", 1);

        try (OrderApiServer other = OrderApiServer.start()) {
            given().baseUri(other.baseUri()).auth().oauth2(token).get("/orders")
                    .then().statusCode(401).body("code", equalTo("INVALID_TOKEN"));

            String otherToken = given().baseUri(other.baseUri()).contentType(ContentType.JSON)
                    .body(Map.of("username", "student", "password", "study123"))
                    .post("/auth/login").then().statusCode(200).extract().path("token");
            given().baseUri(other.baseUri()).auth().oauth2(otherToken).get("/orders")
                    .then().statusCode(200).body("total", equalTo(0)).body("items", hasSize(0));
        }
        assertOrderCount(token, 1);
    }

    @Test
    public void shouldReturnDefinedProtocolErrors() {
        request().get("/unknown")
                .then().statusCode(404).body("code", equalTo("ROUTE_NOT_FOUND"));
        request().post("/products")
                .then().statusCode(405).header("Allow", equalTo("GET"))
                .body("code", equalTo("METHOD_NOT_ALLOWED"));
        request().put("/orders")
                .then().statusCode(405).header("Allow", equalTo("GET, POST"))
                .body("code", equalTo("METHOD_NOT_ALLOWED"));
    }
}
