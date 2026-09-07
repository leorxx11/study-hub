package com.studyhub.api.reference.chapter02;

import com.studyhub.api.support.LocalApiTest;
import io.restassured.http.ContentType;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;

/** 第二章【阅读示例】：展示路径参数、查询参数、请求头和 JSON 请求体。 */
public class RequestConstructionExampleTest extends LocalApiTest {

    @Test
    public void shouldInsertProductIdIntoPath() {
        given()
                .baseUri(baseUri)
                .pathParam("productId", "PRD-1")
        .when()
                .get("/products/{productId}")
        .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("id", equalTo("PRD-1"))
                .body("name", equalTo("Notebook"));
    }

    @Test
    public void shouldSendCategoryAsQueryParameter() {
        given()
                .baseUri(baseUri)
                .queryParam("category", "BAGS")
        .when()
                .get("/products")
        .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("total", equalTo(1));
    }

    @Test
    public void shouldSendLoginAsJson() {
        given()
                .baseUri(baseUri)
                // 请求阶段的 contentType 会设置 Content-Type 请求头。
                .contentType(ContentType.JSON)
                // 请求阶段的 body 是发送给服务端的数据。
                .body("""
                        {"username":"student","password":"study123"}
                        """)
        .when()
                .post("/auth/login")
        .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                // 响应阶段的 body 用于读取并断言响应数据。
                .body("tokenType", equalTo("Bearer"));
    }
}
