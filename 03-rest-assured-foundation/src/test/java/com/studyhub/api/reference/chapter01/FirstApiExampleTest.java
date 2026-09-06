package com.studyhub.api.reference.chapter01;

import com.studyhub.api.support.LocalApiTest;
import io.restassured.http.ContentType;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;

/** 第一章【阅读示例】：代码已经完整。需要你编写的代码在 exercise/chapter01。 */
public class FirstApiExampleTest extends LocalApiTest {

    @Test
    public void shouldGetNotebook() {
        given()
                // baseUri 是本次测试服务的地址，例如 http://127.0.0.1:54321。
                .baseUri(baseUri)
        .when()
                // 发送真正的 HTTP GET 请求。
                .get("/products/PRD-1")
        .then()
                // 检查响应：HTTP 状态、响应格式、JSON 字段。
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("id", equalTo("PRD-1"))
                .body("name", equalTo("Notebook"))
                .body("category", equalTo("STATIONERY"))
                .body("unitPriceCents", equalTo(1200));
    }
}
