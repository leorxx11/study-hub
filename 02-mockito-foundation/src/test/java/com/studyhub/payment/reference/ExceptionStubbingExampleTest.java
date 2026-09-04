package com.studyhub.payment.reference;

import com.studyhub.payment.NotificationService;
import com.studyhub.payment.OrderRepository;
import com.studyhub.payment.PaymentFailedException;
import com.studyhub.payment.PaymentGateway;
import com.studyhub.payment.PaymentOrder;
import com.studyhub.payment.PaymentResult;
import com.studyhub.payment.PaymentService;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * {@code thenThrow(...)} 与 {@code doThrow(...)} 的可运行参考示例。
 */
public class ExceptionStubbingExampleTest {

    @Test
    public void shouldThrowWhenANonVoidMethodIsCalled() {
        PaymentGateway gateway = mock(PaymentGateway.class);

        when(gateway.charge(anyString(), anyInt()))
                .thenThrow(new RuntimeException("Gateway timeout"));

        // 断言
        RuntimeException exception = Assert.expectThrows(
                RuntimeException.class,
                () -> gateway.charge("ORD-1", 350)
        );

        Assert.assertEquals(exception.getMessage(), "Gateway timeout");
        verify(gateway).charge("ORD-1", 350);
    }

    @Test
    public void shouldThrowWhenAVoidMethodIsCalled() {
        NotificationService notificationService = mock(NotificationService.class);

        doThrow(new IllegalStateException("Notification unavailable"))
                .when(notificationService)
                .sendPaymentSucceeded("ORD-1", "TXN-1001");

        IllegalStateException exception = Assert.expectThrows(
                IllegalStateException.class,
                () -> notificationService.sendPaymentSucceeded(
                        "ORD-1",
                        "TXN-1001"
                )
        );

        Assert.assertEquals(exception.getMessage(), "Notification unavailable");
        verify(notificationService)
                .sendPaymentSucceeded("ORD-1", "TXN-1001");
    }

    @Test
    public void shouldNotSaveOrNotifyWhenTheGatewayDeclinesPayment() {
        OrderRepository repository = mock(OrderRepository.class);
        PaymentGateway gateway = mock(PaymentGateway.class);
        NotificationService notificationService = mock(NotificationService.class);
        PaymentService paymentService = new PaymentService(
                repository,
                gateway,
                notificationService
        );
        PaymentOrder pendingOrder = PaymentOrder.pending("ORD-1", 350);

        when(repository.findById("ORD-1"))
                .thenReturn(Optional.of(pendingOrder));
        when(gateway.charge("ORD-1", 350))
                .thenReturn(PaymentResult.failure("Card declined"));

        PaymentFailedException exception = Assert.expectThrows(
                PaymentFailedException.class,
                () -> paymentService.pay("ORD-1")
        );

        Assert.assertEquals(exception.getMessage(), "Payment failed: Card declined");
        verify(repository).findById("ORD-1");
        verify(gateway).charge("ORD-1", 350);
        verify(repository, never()).save(any(PaymentOrder.class));
        verifyNoInteractions(notificationService);
    }
}
