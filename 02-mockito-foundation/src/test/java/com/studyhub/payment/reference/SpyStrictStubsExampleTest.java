package com.studyhub.payment.reference;

import com.studyhub.payment.NotificationService;
import com.studyhub.payment.OrderRepository;
import com.studyhub.payment.OrderStatus;
import com.studyhub.payment.PaymentGateway;
import com.studyhub.payment.PaymentOrder;
import com.studyhub.payment.PaymentResult;
import com.studyhub.payment.PaymentService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoSession;
import org.mockito.quality.Strictness;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.Optional;

import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mockitoSession;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * {@code spy}、严格桩与常见误区的可运行参考示例。
 */
public class SpyStrictStubsExampleTest {
    @Mock
    private OrderRepository orderRepository;

    @Mock
    private PaymentGateway paymentGateway;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private PaymentService paymentService;

    private MockitoSession mockitoSession;

    @BeforeMethod
    public void setUp() {
        paymentService = null;
        mockitoSession = mockitoSession()
                .initMocks(this)
                .strictness(Strictness.STRICT_STUBS)
                .startMocking();
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown() {
        mockitoSession.finishMocking();
    }

    @Test
    public void shouldCallRealSpyMethodsUnlessOneIsStubbed() {
        PaymentAttemptCounter attemptCounter = spy(new PaymentAttemptCounter());

        String firstAttempt = attemptCounter.recordAttempt("ORD-1");
        doReturn("SKIPPED")
                .when(attemptCounter)
                .recordAttempt("ORD-2");
        String secondAttempt = attemptCounter.recordAttempt("ORD-2");

        Assert.assertEquals(firstAttempt, "ORD-1#1");
        Assert.assertEquals(secondAttempt, "SKIPPED");
        Assert.assertEquals(attemptCounter.getAttempts(), 1);
        verify(attemptCounter).recordAttempt("ORD-1");
        verify(attemptCounter).recordAttempt("ORD-2");
    }

    @Test
    public void shouldUseEveryStubInStrictMode() {
        PaymentOrder pendingOrder = PaymentOrder.pending("ORD-3", 650);
        when(orderRepository.findById("ORD-3"))
                .thenReturn(Optional.of(pendingOrder));
        when(paymentGateway.charge("ORD-3", 650))
                .thenReturn(PaymentResult.success("TXN-3001"));

        PaymentOrder paidOrder = paymentService.pay("ORD-3");

        Assert.assertEquals(paidOrder.getStatus(), OrderStatus.PAID);
        Assert.assertEquals(paidOrder.getTransactionId(), "TXN-3001");
        verify(orderRepository).save(paidOrder);
        verify(notificationService)
                .sendPaymentSucceeded("ORD-3", "TXN-3001");
    }

    static class PaymentAttemptCounter {
        private int attempts;

        String recordAttempt(String orderId) {
            attempts++;
            return orderId + "#" + attempts;
        }

        int getAttempts() {
            return attempts;
        }
    }
}
