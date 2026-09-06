package com.studyhub.payment.exercise.chapter01;

import com.studyhub.payment.*;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.Optional;

import static org.mockito.Mockito.*;

/**
 * 第一课：使用 mock、when/thenReturn 和 verify 测试支付成功流程。
 */
public class PaymentServiceBasicMockTest {
    private OrderRepository orderRepository;
    private PaymentGateway paymentGateway;
    private NotificationService notificationService;
    private PaymentService paymentService;

    @BeforeMethod
    public void setUp() {
        // TODO：分别 mock 三个外部依赖。
        orderRepository = mock(OrderRepository.class);
        paymentGateway = mock(PaymentGateway.class);
        notificationService = mock(NotificationService.class);
        // TODO：把三个 Mock 注入真实的 PaymentService。
        paymentService = new PaymentService(orderRepository, paymentGateway, notificationService);
    }

    @Test
    public void shouldPayPendingOrder() {
        PaymentOrder pendingOrder = PaymentOrder.pending("ORD-1", 350);

        // TODO：当仓库查询 ORD-1 时，返回 Optional.of(pendingOrder)。
        when(orderRepository.findById("ORD-1")).thenReturn(Optional.of(pendingOrder));
        // TODO：当网关扣款 ORD-1、350 分时，返回交易号 TXN-1001 的成功结果。
        when(paymentGateway.charge("ORD-1", 350)).thenReturn(PaymentResult.success("TXN-1001"));
        // TODO：调用 paymentService.pay("ORD-1")，接收返回的 paidOrder。
        PaymentOrder paidOrder = paymentService.pay("ORD-1");
        // TODO：断言状态为 PAID，交易号为 TXN-1001。
        Assert.assertEquals(paidOrder.getStatus(), OrderStatus.PAID);
        Assert.assertEquals(paidOrder.getTransactionId(), "TXN-1001");
        // TODO：verify 网关恰好收到 charge("ORD-1", 350)。
        verify(paymentGateway).charge("ORD-1", 350);
        // TODO：verify 仓库保存了 paidOrder。
        verify(orderRepository).save(paidOrder);
        // TODO：verify 通知服务收到订单号和交易号。
        verify(notificationService).sendPaymentSucceeded("ORD-1", "TXN-1001");
    }
}
