package com.studyhub.api.reference.chapter05;

import com.studyhub.api.support.LocalApiTest;
import io.restassured.http.ContentType;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.emptyOrNullString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.not;

/** 第五章【阅读示例】：把上一步响应中的 token 和订单 ID 传给后续请求。 */
public class OrderBusinessFlowExampleTest extends LocalApiTest {

    @Test
    public void shouldCreateQueryPayAndQueryOrder() {
        String token = given()
                .baseUri(baseUri)
                .contentType(ContentType.JSON)
                .body("""
                        {"username":"student","password":"study123"}
                        """)
        .when()
                .post("/auth/login")
        .then()
                .statusCode(200)
                .body("token", not(emptyOrNullString()))
                .extract()
                .path("token");

        String orderId = given()
                .baseUri(baseUri)
                .auth().oauth2(token)
                .contentType(ContentType.JSON)
                .body("""
                        {"productId":"PRD-1","quantity":2}
                        """)
        .when()
                .post("/orders")
        .then()
                .statusCode(201)
                .contentType(ContentType.JSON)
                .body("id", not(emptyOrNullString()))
                .body("product.id", equalTo("PRD-1"))
                .body("quantity", equalTo(2))
                .body("totalAmountCents", equalTo(2400))
                .body("status", equalTo("PENDING"))
                .extract()
                .path("id");

        given()
                .baseUri(baseUri)
                .auth().oauth2(token)
                .pathParam("orderId", orderId)
        .when()
                .get("/orders/{orderId}")
        .then()
                .statusCode(200)
                .body("id", equalTo(orderId))
                .body("status", equalTo("PENDING"));

        given()
                .baseUri(baseUri)
                .auth().oauth2(token)
                .pathParam("orderId", orderId)
        .when()
                .post("/orders/{orderId}/pay")
        .then()
                .statusCode(200)
                .body("id", equalTo(orderId))
                .body("status", equalTo("PAID"));

        given()
                .baseUri(baseUri)
                .auth().oauth2(token)
                .pathParam("orderId", orderId)
        .when()
                .get("/orders/{orderId}")
        .then()
                .statusCode(200)
                .body("id", equalTo(orderId))
                .body("product.id", equalTo("PRD-1"))
                .body("quantity", equalTo(2))
                .body("totalAmountCents", equalTo(2400))
                .body("status", equalTo("PAID"));
    }

    @Test
    public void shouldCreateCancelAndQueryOrder() {
        String token = given()
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

        String orderId = given()
                .baseUri(baseUri)
                .auth().oauth2(token)
                .contentType(ContentType.JSON)
                .body("""
                        {"productId":"PRD-2","quantity":3}
                        """)
        .when()
                .post("/orders")
        .then()
                .statusCode(201)
                .body("status", equalTo("PENDING"))
                .extract()
                .path("id");

        given()
                .baseUri(baseUri)
                .auth().oauth2(token)
                .pathParam("orderId", orderId)
        .when()
                .post("/orders/{orderId}/cancel")
        .then()
                .statusCode(200)
                .body("id", equalTo(orderId))
                .body("status", equalTo("CANCELLED"));

        given()
                .baseUri(baseUri)
                .auth().oauth2(token)
                .pathParam("orderId", orderId)
        .when()
                .get("/orders/{orderId}")
        .then()
                .statusCode(200)
                .body("id", equalTo(orderId))
                .body("product.id", equalTo("PRD-2"))
                .body("quantity", equalTo(3))
                .body("totalAmountCents", equalTo(900))
                .body("status", equalTo("CANCELLED"));
    }
}
