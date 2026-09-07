package com.studyhub.api.reference.chapter04;

import com.studyhub.api.support.LocalApiTest;
import io.restassured.http.ContentType;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.emptyOrNullString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;

/** 第四章【阅读示例】：动态获取 Bearer token，并验证成功和失败的认证请求。 */
public class AuthenticationExampleTest extends LocalApiTest {

    @Test
    public void shouldAccessOrdersWithTokenFromLoginResponse() {
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
                .contentType(ContentType.JSON)
                .body("tokenType", equalTo("Bearer"))
                .body("token", not(emptyOrNullString()))
                .extract()
                .path("token");

        given()
                .baseUri(baseUri)
                // oauth2(token) 会生成请求头：Authorization: Bearer <token>。
                .auth().oauth2(token)
        .when()
                .get("/orders")
        .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("total", equalTo(0))
                .body("items", hasSize(0));
    }

    @Test
    public void shouldRejectRequestWithoutAuthorizationHeader() {
        given()
                .baseUri(baseUri)
        .when()
                .get("/orders")
        .then()
                .statusCode(401)
                .contentType(ContentType.JSON)
                .header("WWW-Authenticate", equalTo("Bearer"))
                .body("code", equalTo("AUTH_REQUIRED"))
                .body("message", equalTo("Bearer token is required"));
    }

    @Test
    public void shouldRejectUnknownBearerToken() {
        given()
                .baseUri(baseUri)
                .auth().oauth2("token-that-does-not-exist")
        .when()
                .get("/orders")
        .then()
                .statusCode(401)
                .contentType(ContentType.JSON)
                .header("WWW-Authenticate", equalTo("Bearer"))
                .body("code", equalTo("INVALID_TOKEN"))
                .body("message", equalTo("Invalid bearer token"));
    }
}
