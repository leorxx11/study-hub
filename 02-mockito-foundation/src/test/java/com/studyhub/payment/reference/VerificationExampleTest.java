package com.studyhub.payment.reference;

import com.studyhub.payment.NotificationService;
import com.studyhub.payment.OrderRepository;
import com.studyhub.payment.PaymentGateway;
import com.studyhub.payment.PaymentService;
import org.testng.Assert;
import org.testng.annotations.Test;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

/**
 * {@code verify(...)} 的可运行参考示例。
 */
public class VerificationExampleTest {

    @Test
    public void shouldVerifyOneExactCall() {
        NotificationService notificationService = mock(NotificationService.class);

        notificationService.sendPaymentSucceeded("ORD-1", "TXN-1001");

        // verify(mock) 默认表示 times(1)。方法和参数也必须匹配。
        verify(notificationService)
                .sendPaymentSucceeded("ORD-1", "TXN-1001");
    }

    @Test
    public void shouldVerifyDifferentCallCounts() {
        PaymentGateway gateway = mock(PaymentGateway.class);

        gateway.charge("ORD-1", 350);
        gateway.charge("ORD-1", 350);

        verify(gateway, times(2)).charge("ORD-1", 350);
        verify(gateway, never()).charge("ORD-2", 350);
    }

    @Test
    public void shouldNotTouchDependenciesWhenOrderIdIsBlank() {
        OrderRepository repository = mock(OrderRepository.class);
        PaymentGateway gateway = mock(PaymentGateway.class);
        NotificationService notificationService = mock(NotificationService.class);
        PaymentService paymentService = new PaymentService(
                repository,
                gateway,
                notificationService
        );

        IllegalArgumentException exception = Assert.expectThrows(
                IllegalArgumentException.class,
                () -> paymentService.pay(" ")
        );

        Assert.assertEquals(exception.getMessage(), "Order id must not be blank");
        verifyNoInteractions(repository, gateway, notificationService);
    }
}
