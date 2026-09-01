package com.studyhub.order.advanced;

import com.studyhub.order.Order;
import com.studyhub.order.OrderService;
import com.studyhub.order.OrderStatus;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import org.testng.asserts.SoftAssert;

/**
 * TestNG {@link SoftAssert} 的参考示例。
 *
 * <p>普通断言第一次失败就会中断方法；SoftAssert 会先收集多个失败，直到调用
 * {@link SoftAssert#assertAll()} 时才统一让测试失败。</p>
 */
public class OrderSoftAssertExampleTest {
    private OrderService orderService;

    @BeforeMethod(alwaysRun = true)
    public void setUp() {
        orderService = new OrderService();
    }

    @Test(
            groups = {"smoke", "regression"},
            description = "All observable fields of a new order are checked together"
    )
    public void shouldVerifyAllNewOrderDetails() {
        Order order = orderService.createOrder(" Notebook ", 2, 350, 5);

        // 每次调用创建新的 SoftAssert，避免断言结果在测试之间共享。
        SoftAssert softly = new SoftAssert();
        softly.assertEquals(order.getId(), "ORD-1", "订单号应从 ORD-1 开始");
        softly.assertEquals(order.getProductName(), "Notebook", "商品名应去除首尾空格");
        softly.assertEquals(order.getQuantity(), 2, "数量应被保留");
        softly.assertEquals(order.getUnitPriceCents(), 350, "单价应被保留");
        softly.assertEquals(order.getTotalAmountCents(), 700, "总价应为数量乘以单价");
        softly.assertEquals(order.getStatus(), OrderStatus.PENDING, "新订单应为 PENDING");
        softly.assertEquals(orderService.getOrderCount(), 1, "服务中应保存一笔订单");

        // 没有这一句，上面失败的软断言不会让测试失败。
        softly.assertAll();
    }
}
