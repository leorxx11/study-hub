package com.studyhub.order.advanced;

import com.studyhub.order.Order;
import com.studyhub.order.OrderService;
import com.studyhub.order.OrderStatus;
import org.testng.SkipException;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;

/**
 * TestNG {@link SkipException} 的参考示例。
 *
 * <p>与 {@code enabled = false} 不同，SkipException 是测试运行时根据前置条件做出的决定。
 * 例如外部支付网关尚未配置时，测试应标记为跳过，而不是伪装成通过或失败。</p>
 */
public class OrderSkipExceptionExampleTest {
    private OrderService orderService;

    @BeforeMethod(alwaysRun = true)
    public void setUp() {
        orderService = new OrderService();
    }

    @Test(groups = {"smoke", "regression"})
    public void shouldCreateOrderWithoutExternalDependencies() {
        Order order = orderService.createOrder("Notebook", 1, 350, 10);

        assertEquals(order.getStatus(), OrderStatus.PENDING);
    }

    @Test(groups = {"integration", "regression"})
    public void shouldPayOrderWhenPaymentGatewayIsAvailable() {
        if (!isPaymentGatewayAvailable()) {
            throw new SkipException(
                    "Payment gateway is not configured. Set -Dpayment.gateway.available=true to run this test."
            );
        }

        Order pendingOrder = orderService.createOrder("Notebook", 1, 350, 10);
        Order paidOrder = orderService.pay(pendingOrder.getId());

        assertEquals(paidOrder.getStatus(), OrderStatus.PAID);
    }

    private boolean isPaymentGatewayAvailable() {
        return Boolean.parseBoolean(System.getProperty("payment.gateway.available", "false"));
    }
}
