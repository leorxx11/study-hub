package com.studyhub.api.verification;

import com.studyhub.api.OrderApiServer;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.net.ConnectException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/** 配套环境验收：服务关闭后，该地址不再接受 HTTP 连接。 */
public class ServerLifecycleTest {
    @Test
    public void shouldCloseTheHttpListener() throws Exception {
        URI endpoint;
        try (HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2)).build()) {
            try (OrderApiServer server = OrderApiServer.start()) {
                endpoint = URI.create(server.baseUri() + "/products");
                HttpResponse<String> response = client.send(HttpRequest.newBuilder(endpoint).GET().build(),
                        HttpResponse.BodyHandlers.ofString());
                Assert.assertEquals(response.statusCode(), 200);
            }
        }

        try (HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2)).build()) {
            HttpRequest request = HttpRequest.newBuilder(endpoint).timeout(Duration.ofSeconds(2)).GET().build();
            Assert.expectThrows(ConnectException.class,
                    () -> client.send(request, HttpResponse.BodyHandlers.ofString()));
        }
    }
}
