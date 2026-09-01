package com.studyhub.order.capstone;

import com.studyhub.order.Order;
import com.studyhub.order.OrderService;
import com.studyhub.order.OrderStatus;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * 综合练习第二关：订单生命周期依赖链。
 *
 * <p>本练习故意让三个测试共享同一个订单，用来练习 dependsOnMethods。</p>
 */
public class OrderLifecycleTest {
    private OrderService orderService;
    private String orderId;

    @BeforeClass(alwaysRun = true)
    public void createPendingOrder() {
        // TODO：创建 OrderService。
        // TODO：创建一个 PENDING 订单，并把订单号保存到 orderId。
        orderService = new OrderService();
        orderId = orderService.createOrder("pen",1,5,10).getId();
    }

    @Test(groups = {"smoke", "regression", "payment"})
    public void shouldPayPendingOrder() {
        // TODO：支付 orderId 对应的订单，并断言返回订单的状态为 PAID。
        Order pay = orderService.pay(orderId);
        Assert.assertEquals(pay.getStatus(), OrderStatus.PAID);
    }

    @Test(
            groups = {"regression", "shipping"},
            dependsOnMethods = "shouldPayPendingOrder"
    )
    public void shouldShipPaidOrder() {
        // TODO：发货，并断言返回订单的状态为 SHIPPED。
        Order shipped = orderService.ship(orderId);
        Assert.assertEquals(shipped.getStatus(),OrderStatus.SHIPPED);
    }

    @Test(
            groups = {"regression", "completion"},
            dependsOnMethods = "shouldShipPaidOrder"
    )
    public void shouldCompleteShippedOrder() {
        // TODO：完成订单，并断言返回订单的状态为 COMPLETED。
        // TODO：再通过 getOrder(orderId) 查询一次，确认最终状态仍是 COMPLETED。
        Order completed = orderService.complete(orderId);
        Assert.assertEquals(completed.getStatus(),OrderStatus.COMPLETED);
        Order order = orderService.getOrder(orderId);
        Assert.assertEquals(order.getStatus(),OrderStatus.COMPLETED);
    }
}
