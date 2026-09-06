package com.studyhub.payment.exercise.chapter03;

import com.studyhub.payment.*;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * 第三章练习：异常、void 方法与失败路径。
 *
 * <p>在 IntelliJ IDEA 中单独运行本类。只完成 TODO，不修改业务代码。</p>
 */
public class ExceptionStubbingExercise {

    @Test
    public void shouldThrowWhenGatewayTimesOut() {
        // TODO：
        // 1. 手动创建 PaymentGateway Mock。
        PaymentGateway paymentGateway = mock(PaymentGateway.class);
        // 2. 使用 thenThrow()：调用 charge("ORD-9", 1200) 时抛出
        //    RuntimeException("Gateway timeout")。
        when(paymentGateway.charge(eq("ORD-9"), eq(1200)))
                .thenThrow(new RuntimeException("Gateway timeout"));
        // 3. 使用 Assert.expectThrows() 捕获异常。
        RuntimeException exception = Assert.expectThrows(RuntimeException.class, () -> paymentGateway
                .charge("ORD-9", 1200));
        // 4. 断言异常消息，并验证网关调用发生一次。
        Assert.assertEquals(exception.getMessage(), "Gateway timeout");
        verify(paymentGateway).charge("ORD-9", 1200);
    }

    @Test
    public void shouldThrowWhenNotificationCannotBeSent() {
        // TODO：
        // 1. 手动创建 NotificationService Mock。
        NotificationService notificationService = mock(NotificationService.class);
        // 2. 使用 doThrow()：调用 sendPaymentSucceeded("ORD-9", "TXN-9001") 时抛出
        //    IllegalStateException("Notification unavailable")。
        doThrow(new IllegalStateException("Notification unavailable"))
                .when(notificationService)
                .sendPaymentSucceeded(eq("ORD-9"), eq("TXN-9001"));
        // 3. 捕获并断言异常类型与消息。
        IllegalStateException illegalStateException = Assert.expectThrows(IllegalStateException.class,
                () -> notificationService.sendPaymentSucceeded("ORD-9", "TXN-9001"));
        Assert.assertEquals(illegalStateException.getMessage(), "Notification unavailable");
        // 4. 验证通知调用发生一次。
        verify(notificationService).sendPaymentSucceeded("ORD-9", "TXN-9001");
    }

    @Test
    public void shouldNotSaveOrNotifyWhenPaymentIsDeclined() {
        // TODO：
        // 1. 手动创建 OrderRepository、PaymentGateway、NotificationService 三个 Mock。
        OrderRepository orderRepository = mock(OrderRepository.class);
        PaymentGateway paymentGateway = mock(PaymentGateway.class);
        NotificationService notificationService = mock(NotificationService.class);
        // 2. 将三个 Mock 注入真实的 PaymentService。
        PaymentService paymentService = new PaymentService(orderRepository, paymentGateway, notificationService);
        // 3. 仓库返回 ORD-9、金额 1200 的 PENDING 订单。
        PaymentOrder pending = PaymentOrder.pending("ORD-9", 1200);
        when(orderRepository.findById(eq("ORD-9")))
                .thenReturn(Optional.of(pending));
        // 4. 网关返回 PaymentResult.failure("Insufficient funds")。
        when(paymentGateway.charge(eq("ORD-9"), eq(1200)))
                .thenReturn(PaymentResult.failure("Insufficient funds"));
        // 5. 断言 pay("ORD-9") 抛出 PaymentFailedException，消息为
        //    Payment failed: Insufficient funds。
        PaymentFailedException exception = Assert.expectThrows(PaymentFailedException.class,
                () -> paymentService.pay("ORD-9"));
        Assert.assertEquals(exception.getMessage(), "Payment failed: Insufficient funds");
        // 6. 验证查询和扣款各发生一次。
        verify(orderRepository).findById("ORD-9");
        verify(paymentGateway).charge("ORD-9", 1200);
        // 7. 验证没有保存订单，也没有调用通知服务。
        verify(orderRepository, never()).save(any());
        verify(notificationService, never()).sendPaymentSucceeded(any(), any());
    }
}
