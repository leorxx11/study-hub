package com.studyhub.order.advanced;

import com.studyhub.order.Order;
import com.studyhub.order.OrderService;
import com.studyhub.order.OrderStatus;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;

/**
 * 配合 {@code testng-listener-lifecycle.xml} 观察不同 Listener 的监听范围。
 */
public class OrderListenerLifecycleExample {
    private OrderService orderService;

    @BeforeMethod(alwaysRun = true)
    public void createFreshOrderService() {
        orderService = new OrderService();
    }

    @Test(groups = {"listener", "regression"})
    public void shouldCreateOrder() {
        Order order = orderService.createOrder("Notebook", 1, 350, 10);

        assertEquals(order.getId(), "ORD-1");
        assertEquals(order.getStatus(), OrderStatus.PENDING);
    }

    @AfterMethod(alwaysRun = true)
    public void releaseOrderService() {
        orderService = null;
    }
}
