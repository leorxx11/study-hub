package com.studyhub.order.advanced;

import com.studyhub.order.Order;
import com.studyhub.order.OrderService;
import com.studyhub.order.OrderStatus;
import com.studyhub.order.retry.RetryOnceAnalyzer;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.util.concurrent.atomic.AtomicInteger;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

/**
 * TestNG {@code IRetryAnalyzer} 的参考示例。
 *
 * <p>第一次调用模拟支付网关暂时不可用，第二次调用成功。这个计数器只用于让教学示例稳定复现；
 * 真实项目应根据明确的瞬时错误类型决定是否重试。</p>
 */
public class OrderRetryExample {
    private static final AtomicInteger PAYMENT_GATEWAY_ATTEMPTS = new AtomicInteger();

    @BeforeClass(alwaysRun = true)
    public void resetGatewaySimulation() {
        PAYMENT_GATEWAY_ATTEMPTS.set(0);
    }

    @Test(
            retryAnalyzer = RetryOnceAnalyzer.class,
            groups = {"retry", "regression"},
            description = "A temporary payment-gateway failure is retried once"
    )
    public void shouldPayOrderAfterTemporaryGatewayFailure() {
        OrderService orderService = new OrderService();
        String orderId = orderService.createOrder("Notebook", 1, 350, 10).getId();

        int attempt = PAYMENT_GATEWAY_ATTEMPTS.incrementAndGet();
        boolean gatewayAvailable = attempt > 1;

        assertTrue(
                gatewayAvailable,
                "模拟支付网关临时不可用：第 " + attempt + " 次调用失败"
        );

        Order paidOrder = orderService.pay(orderId);
        assertEquals(paidOrder.getStatus(), OrderStatus.PAID);
    }
}
