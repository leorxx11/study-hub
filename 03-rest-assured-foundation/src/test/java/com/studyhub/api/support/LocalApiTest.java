package com.studyhub.api.support;

import com.studyhub.api.OrderApiServer;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;

import java.io.IOException;

/** 配套测试环境：每条测试启动独立服务，执行结束后释放端口。 */
public abstract class LocalApiTest {
    protected String baseUri;
    private OrderApiServer server;

    @BeforeMethod
    public void startLocalApi() throws IOException {
        server = OrderApiServer.start();
        baseUri = server.baseUri();
    }

    @AfterMethod
    public void stopLocalApi() {
        server.close();
    }
}
