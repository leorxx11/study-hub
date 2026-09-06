package com.studyhub.payment.reference;

import com.studyhub.payment.NotificationService;
import com.studyhub.payment.OrderRepository;
import com.studyhub.payment.OrderStatus;
import com.studyhub.payment.PaymentGateway;
import com.studyhub.payment.PaymentOrder;
import com.studyhub.payment.PaymentResult;
import com.studyhub.payment.PaymentService;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * {@link ArgumentCaptor} 与 {@link InOrder} 的可运行参考示例。
 */
public class ArgumentCaptorInOrderExampleTest {
    @Mock
    private OrderRepository orderRepository;

    @Mock
    private PaymentGateway paymentGateway;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private PaymentService paymentService;

    @Captor
    private ArgumentCaptor<PaymentOrder> savedOrderCaptor;

    private AutoCloseable mocks;

    @BeforeMethod
    public void setUp() {
        paymentService = null;
        mocks = MockitoAnnotations.openMocks(this);
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown() throws Exception {
        mocks.close();
    }

    @Test
    public void shouldCaptureTheOrderPassedToSave() {
        PaymentOrder pendingOrder = PaymentOrder.pending("ORD-1", 350);
        when(orderRepository.findById("ORD-1"))
                .thenReturn(Optional.of(pendingOrder));
        when(paymentGateway.charge("ORD-1", 350))
                .thenReturn(PaymentResult.success("TXN-1001"));

        PaymentOrder returnedOrder = paymentService.pay("ORD-1");

        verify(orderRepository).save(savedOrderCaptor.capture());
        PaymentOrder savedOrder = savedOrderCaptor.getValue();
        Assert.assertSame(savedOrder, returnedOrder);
        Assert.assertEquals(savedOrder.getId(), "ORD-1");
        Assert.assertEquals(savedOrder.getAmountCents(), 350);
        Assert.assertEquals(savedOrder.getStatus(), OrderStatus.PAID);
        Assert.assertEquals(savedOrder.getTransactionId(), "TXN-1001");
    }

    @Test
    public void shouldCallDependenciesInPaymentOrder() {
        PaymentOrder pendingOrder = PaymentOrder.pending("ORD-2", 500);
        when(orderRepository.findById("ORD-2"))
                .thenReturn(Optional.of(pendingOrder));
        when(paymentGateway.charge("ORD-2", 500))
                .thenReturn(PaymentResult.success("TXN-2001"));

        paymentService.pay("ORD-2");

        InOrder callOrder = inOrder(
                orderRepository,
                paymentGateway,
                notificationService
        );
        callOrder.verify(orderRepository).findById("ORD-2");
        callOrder.verify(paymentGateway).charge("ORD-2", 500);
        callOrder.verify(orderRepository).save(any(PaymentOrder.class));
        callOrder.verify(notificationService)
                .sendPaymentSucceeded("ORD-2", "TXN-2001");
        callOrder.verifyNoMoreInteractions();
    }
}
