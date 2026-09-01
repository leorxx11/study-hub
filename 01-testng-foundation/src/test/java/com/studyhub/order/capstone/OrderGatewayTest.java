package com.studyhub.order.capstone;

import com.studyhub.order.Order;
import com.studyhub.order.OrderService;
import com.studyhub.order.OrderStatus;
import com.studyhub.order.retry.RetryOnceAnalyzer;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.util.concurrent.atomic.AtomicInteger;

/**
 * 综合练习第三关：支付网关瞬时失败与重试。
 *
 * <p>Listener 将在最终的 testng-capstone.xml 中统一注册，避免同时使用
 * {@code @Listeners} 和 XML 重复注册。</p>
 */
public class OrderGatewayTest {
    private static final AtomicInteger PAYMENT_GATEWAY_ATTEMPTS = new AtomicInteger();

    @BeforeClass(alwaysRun = true)
    public void resetGatewaySimulation() {
        // TODO：把 PAYMENT_GATEWAY_ATTEMPTS 重置为 0。
        // 注意：这里不要改成 @BeforeMethod，否则重试前可能再次清零。
        PAYMENT_GATEWAY_ATTEMPTS.set(0);
    }

    @Test(
            groups = {"regression", "gateway"},
            retryAnalyzer = RetryOnceAnalyzer.class,
            description = "A temporary payment-gateway failure is retried once"
    )
    public void shouldPayOrderAfterTemporaryGatewayFailure() {
        // TODO：创建 OrderService，并创建一个 PENDING 订单。
        // TODO：将 PAYMENT_GATEWAY_ATTEMPTS 加 1，取得当前 attempt。
        // TODO：用 Assert.assertTrue 验证 attempt > 1，并在失败消息中打印 attempt。
        // TODO：网关可用后支付订单，断言返回订单的状态为 PAID。
        OrderService orderService = new OrderService();
        String orderId = orderService.createOrder("pen", 1, 5, 10).getId();
        int attempt = PAYMENT_GATEWAY_ATTEMPTS.incrementAndGet();
        boolean gatewayAvailable = attempt > 1;

        Assert.assertTrue(gatewayAvailable,"第"+ attempt + "尝试");

        Order pay = orderService.pay(orderId);
        Assert.assertEquals(pay.getStatus(),OrderStatus.PAID);

    }
}
