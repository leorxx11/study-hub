package com.studyhub.api.reference.chapter03;

import com.studyhub.api.support.LocalApiTest;
import io.restassured.http.ContentType;
import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;

/** 第三章【阅读示例】：验证嵌套 JSON 和数组，并从响应中提取数据。 */
public class ResponseAssertionAndExtractionExampleTest extends LocalApiTest {

    @Test
    public void shouldValidateNestedProductList() {
        given()
                .baseUri(baseUri)
                .queryParam("category", "STATIONERY")
        .when()
                .get("/products")
        .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("total", equalTo(2))
                // items 是 JSON 数组，hasSize 验证数组长度。
                .body("items", hasSize(2))
                // items.id 会取出数组中所有对象的 id。
                .body("items.id", contains("PRD-1", "PRD-2"))
                .body("items.name", contains("Notebook", "Pen"))
                // [0] 和 [1] 分别访问数组中的第一个和第二个元素。
                .body("items[0].unitPriceCents", equalTo(1200))
                .body("items[1].unitPriceCents", equalTo(300));
    }

    @Test
    public void shouldExtractFieldsForLaterUse() {
        Response response = given()
                .baseUri(baseUri)
        .when()
                .get("/products")
        .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                // extract() 从断言阶段取回真实响应。
                .extract()
                .response();

        // response.path(...) 适合直接提取一个字段。
        String firstProductId = response.path("items[0].id");

        // JsonPath 适合从同一个响应中继续读取多个字段。
        JsonPath jsonPath = response.jsonPath();
        int total = jsonPath.getInt("total");
        List<String> productNames = jsonPath.getList("items.name", String.class);

        Assert.assertEquals(firstProductId, "PRD-1");
        Assert.assertEquals(total, 3);
        Assert.assertEquals(productNames, List.of("Notebook", "Pen", "Backpack"));
    }
}
