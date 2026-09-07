package com.studyhub.api.reference.chapter06;

import com.studyhub.api.support.LocalApiTest;
import io.restassured.http.ContentType;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;

/** 第六章【阅读示例】：使用 DataProvider 覆盖边界，并验证失败请求不会破坏业务状态。 */
public class FailurePathsAndDataDrivenExampleTest extends LocalApiTest {

    @DataProvider
    public Object[][] validQuantityBoundaries() {
        return new Object[][]{
                {1, 1200},
                {10, 12000}
        };
    }

    @Test(dataProvider = "validQuantityBoundaries")
    public void shouldAcceptValidQuantityBoundaries(int quantity, int expectedTotalAmountCents) {
        String token = login();

        given()
                .baseUri(baseUri)
                .auth().oauth2(token)
                .contentType(ContentType.JSON)
                .body("""
                        {"productId":"PRD-1","quantity":%d}
                        """.formatted(quantity))
        .when()
                .post("/orders")
        .then()
                .statusCode(201)
                .contentType(ContentType.JSON)
                .body("quantity", equalTo(quantity))
                .body("totalAmountCents", equalTo(expectedTotalAmountCents))
                .body("status", equalTo("PENDING"));
    }

    @DataProvider
    public Object[][] invalidQuantityBoundaries() {
        return new Object[][]{
                {0},
                {11}
        };
    }

    @Test(dataProvider = "invalidQuantityBoundaries")
    public void shouldRejectInvalidQuantityWithoutCreatingOrder(int quantity) {
        String token = login();

        given()
                .baseUri(baseUri)
                .auth().oauth2(token)
                .contentType(ContentType.JSON)
                .body("""
                        {"productId":"PRD-1","quantity":%d}
                        """.formatted(quantity))
        .when()
                .post("/orders")
        .then()
                .statusCode(400)
                .contentType(ContentType.JSON)
                .body("code", equalTo("INVALID_QUANTITY"))
                .body("message", equalTo("quantity must be between 1 and 10"));

        given()
                .baseUri(baseUri)
                .auth().oauth2(token)
        .when()
                .get("/orders")
        .then()
                .statusCode(200)
                .body("total", equalTo(0))
                .body("items", hasSize(0));
    }

    @Test
    public void shouldReportMissingOrder() {
        String token = login();

        given()
                .baseUri(baseUri)
                .auth().oauth2(token)
                .pathParam("orderId", "ORD-404")
        .when()
                .get("/orders/{orderId}")
        .then()
                .statusCode(404)
                .contentType(ContentType.JSON)
                .body("code", equalTo("ORDER_NOT_FOUND"))
                .body("message", equalTo("Order not found: ORD-404"));
    }

    @Test
    public void shouldKeepPaidOrderUnchangedWhenCancelConflicts() {
        String token = login();
        String orderId = createOrder(token, "PRD-2", 2);

        given()
                .baseUri(baseUri)
                .auth().oauth2(token)
                .pathParam("orderId", orderId)
        .when()
                .post("/orders/{orderId}/pay")
        .then()
                .statusCode(200)
                .body("status", equalTo("PAID"));

        given()
                .baseUri(baseUri)
                .auth().oauth2(token)
                .pathParam("orderId", orderId)
        .when()
                .post("/orders/{orderId}/cancel")
        .then()
                .statusCode(409)
                .contentType(ContentType.JSON)
                .body("code", equalTo("ORDER_STATE_CONFLICT"))
                .body("message", equalTo("Only PENDING orders can be paid or cancelled"));

        given()
                .baseUri(baseUri)
                .auth().oauth2(token)
                .pathParam("orderId", orderId)
        .when()
                .get("/orders/{orderId}")
        .then()
                .statusCode(200)
                .body("id", equalTo(orderId))
                .body("status", equalTo("PAID"));
    }

    private String login() {
        return given()
                .baseUri(baseUri)
                .contentType(ContentType.JSON)
                .body("""
                        {"username":"student","password":"study123"}
                        """)
        .when()
                .post("/auth/login")
        .then()
                .statusCode(200)
                .extract()
                .path("token");
    }

    private String createOrder(String token, String productId, int quantity) {
        return given()
                .baseUri(baseUri)
                .auth().oauth2(token)
                .contentType(ContentType.JSON)
                .body("""
                        {"productId":"%s","quantity":%d}
                        """.formatted(productId, quantity))
        .when()
                .post("/orders")
        .then()
                .statusCode(201)
                .extract()
                .path("id");
    }
}
