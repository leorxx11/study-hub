package com.studyhub.order.advanced;

import com.studyhub.order.Order;
import com.studyhub.order.OrderService;
import com.studyhub.order.OrderStatus;
import org.testng.Reporter;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;

/**
 * 演示将关键测试步骤写入 TestNG 默认 HTML 报告。
 */
public class OrderReportExample {

    @Test(groups = {"report", "regression"})
    public void shouldCreateOrderAndRecordReportSteps() {
        Reporter.log("步骤 1：创建 Notebook 订单，数量为 2，单价为 350 分");

        OrderService orderService = new OrderService();
        Order order = orderService.createOrder("Notebook", 2, 350, 10);

        Reporter.log("步骤 2：订单创建成功，订单号为 " + order.getId());
        assertEquals(order.getTotalAmountCents(), 700, "订单总价应为 700 分");

        Reporter.log("步骤 3：验证订单状态为 PENDING");
        assertEquals(order.getStatus(), OrderStatus.PENDING);
    }
}
