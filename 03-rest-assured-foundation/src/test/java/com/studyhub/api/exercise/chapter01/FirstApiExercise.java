package com.studyhub.api.exercise.chapter01;

import com.studyhub.api.support.LocalApiTest;
import io.restassured.http.ContentType;
import org.testng.Assert;
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
        // TODO：请求 GET /products/PRD-2。
        // 断言 HTTP 200、JSON 响应。
        // 断言 id=PRD-2、name=Pen、category=STATIONERY、unitPriceCents=300。
        Assert.fail("TODO：完成商品查询成功测试");
    }

    @Test
    public void shouldReportMissingProduct() {
        // TODO：请求 GET /products/PRD-404。
        // 断言 HTTP 404、JSON 响应。
        // 断言 code=PRODUCT_NOT_FOUND、message=Product not found: PRD-404。
        Assert.fail("TODO：完成商品不存在测试");
    }
}
