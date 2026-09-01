package com.studyhub.order.advanced;

import com.studyhub.order.Order;
import com.studyhub.order.OrderService;
import com.studyhub.order.OrderStatus;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertNotNull;

/**
 * TestNG {@code @Test} 执行控制属性的参考示例。
 *
 * <p>这里刻意让订单状态流转形成依赖链，用来观察 {@code dependsOnMethods} 和
 * {@code dependsOnGroups} 的行为。常规业务测试仍应尽量彼此独立，不要把这种依赖链当成默认写法。</p>
 */
public class OrderLifecycleControlExampleTest {
    private OrderService orderService;
    private String orderId;

    @BeforeClass(alwaysRun = true)
    public void createPendingOrder() {
        orderService = new OrderService();
        orderId = orderService.createOrder("Notebook", 1, 350, 10).getId();
    }

    @Test(
            priority = 1,
            groups = {"smoke", "regression", "payment"},
            description = "A pending order can be paid"
    )
    public void shouldPayPendingOrder() {
        Order paidOrder = orderService.pay(orderId);

        assertEquals(paidOrder.getStatus(), OrderStatus.PAID);
    }

    @Test(
            priority = 2,
            groups = {"regression", "shipping"},
            dependsOnMethods = "shouldPayPendingOrder",
            description = "Shipping only begins after payment succeeds"
    )
    public void shouldShipPaidOrder() {
        Order shippedOrder = orderService.ship(orderId);

        assertEquals(shippedOrder.getStatus(), OrderStatus.SHIPPED);
    }

    @Test(
            priority = 3,
            groups = {"regression", "completion"},
            dependsOnGroups = "shipping",
            description = "Completion waits for every shipping-group test"
    )
    public void shouldCompleteShippedOrder() {
        Order completedOrder = orderService.complete(orderId);

        assertEquals(completedOrder.getStatus(), OrderStatus.COMPLETED);
    }

    @Test(
            priority = 4,
            groups = {"regression", "lifecycle-summary"},
            dependsOnGroups = "shipping",
            alwaysRun = true, //“别因为前面的失败或依赖关系就把我跳过。”
            description = "This diagnostic still runs when its dependency fails"
    )
    public void shouldAlwaysRecordLifecycleContext() {
        assertNotNull(orderService);
        assertNotNull(orderId);
    }

    @Test(
            enabled = false,
            description = "A not-yet-ready test can be deliberately disabled"
    )
    public void pendingCancellationFeatureIsDisabled() {
        throw new AssertionError("This method should not run while enabled is false");
    }

    @Test(
            priority = 5,
            timeOut = 500, // 时间内完成
            groups = {"smoke", "regression"},
            description = "A short check must finish within 500 ms"
    )
    public void shouldFinishHealthCheckWithinTimeout() throws InterruptedException {
        Thread.sleep(10);

        assertEquals(orderService.getOrderCount(), 1);
    }
}
