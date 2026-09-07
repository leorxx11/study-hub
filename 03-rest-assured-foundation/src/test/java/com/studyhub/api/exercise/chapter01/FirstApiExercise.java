package com.studyhub.api.exercise.chapter01;

import com.studyhub.api.support.LocalApiTest;
import io.restassured.http.ContentType;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;

/**
 * 第一章【你来编写】：只使用 given、baseUri、when、get、then、statusCode、contentType、body、equalTo。
 * 完成每个测试后，删除该方法内的 Assert.fail("TODO...")。
 * 运行：mvn -Dtest=FirstApiExercise test
 */
public class FirstApiExercise extends LocalApiTest {

    @Test
    public void shouldGetPen() {
        // 请求 GET /products/PRD-2。
        // 断言 HTTP 200、JSON 响应。
        // 断言 id=PRD-2、name=Pen、category=STATIONERY、unitPriceCents=300。
        given()
                .baseUri(baseUri)
        .when()
                .get("/products/PRD-2")
        .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("id", equalTo("PRD-2"))
                .body("name", equalTo("Pen"))
                .body("category", equalTo("STATIONERY"))
                .body("unitPriceCents", equalTo(300));
    }

    @Test
    public void shouldReportMissingProduct() {
        // 请求 GET /products/PRD-404。
        // 断言 HTTP 404、JSON 响应。
        // 断言 code=PRODUCT_NOT_FOUND、message=Product not found: PRD-404。
        given()
                .baseUri(baseUri)
        .when()
                .get("/products/PRD-404")
        .then()
                .statusCode(404)
                .contentType(ContentType.JSON)
                .body("code", equalTo("PRODUCT_NOT_FOUND"))
                .body("message", equalTo("Product not found: PRD-404"));
    }
}
