package com.studyhub.order.advanced;

import com.studyhub.order.Order;
import com.studyhub.order.OrderService;
import com.studyhub.order.OrderStatus;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;

/**
 * TestNG 并行执行的参考示例。
 *
 * <p>由 {@code testng-parallel.xml} 中的 {@code parallel="methods"} 开启方法级并行。
 * 每个测试方法都创建自己的 {@link OrderService}，因为它内部保存了可变订单数据，不能被多个
 * 并行方法共享。</p>
 */
public class OrderParallelExecutionExample {

    @Test(groups = {"parallel", "regression"})
    public void shouldCreateNotebookOrderOnAnIndependentService() throws InterruptedException {
        verifyIndependentOrderCreation("Notebook", 1, 350);
    }

    @Test(groups = {"parallel", "regression"})
    public void shouldCreateKeyboardOrderOnAnIndependentService() throws InterruptedException {
        verifyIndependentOrderCreation("Keyboard", 2, 120);
    }

    @Test(groups = {"parallel", "regression"})
    public void shouldCreateMouseOrderOnAnIndependentService() throws InterruptedException {
        verifyIndependentOrderCreation("Mouse", 3, 80);
    }

    private void verifyIndependentOrderCreation(
            String productName,
            int quantity,
            int unitPriceCents
    ) throws InterruptedException {
        OrderService orderService = new OrderService();
        Order order = orderService.createOrder(productName, quantity, unitPriceCents, 10);

        // 仅为了让控制台更容易观察到三个方法交错执行，不是业务断言的一部分。
        Thread.sleep(150);

        assertEquals(order.getId(), "ORD-1");
        assertEquals(order.getProductName(), productName);
        assertEquals(order.getStatus(), OrderStatus.PENDING);
        assertEquals(orderService.getOrderCount(), 1);
    }
}
