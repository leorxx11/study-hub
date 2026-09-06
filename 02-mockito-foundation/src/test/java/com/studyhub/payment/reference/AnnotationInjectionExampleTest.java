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
import org.mockito.MockitoAnnotations;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * {@link Mock}、{@link InjectMocks} 与 TestNG 生命周期的可运行参考示例。
 */
public class AnnotationInjectionExampleTest {
    @Mock
    private OrderRepository orderRepository;

    @Mock
    private PaymentGateway paymentGateway;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private PaymentService paymentService;

    private AutoCloseable mocks;

    @BeforeMethod
    public void setUp() {
        // TestNG 复用测试类实例；清空后，@InjectMocks 才会为本次测试重新创建被测对象。
        paymentService = null;
        mocks = MockitoAnnotations.openMocks(this);
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown() throws Exception {
        mocks.close();
    }

    @Test
    public void shouldPayPendingOrderWithInjectedMocks() {
        PaymentOrder pendingOrder = PaymentOrder.pending("ORD-1", 350);
        when(orderRepository.findById("ORD-1"))
                .thenReturn(Optional.of(pendingOrder));
        when(paymentGateway.charge("ORD-1", 350))
                .thenReturn(PaymentResult.success("TXN-1001"));

        PaymentOrder paidOrder = paymentService.pay("ORD-1");

        Assert.assertEquals(paidOrder.getStatus(), OrderStatus.PAID);
        Assert.assertEquals(paidOrder.getTransactionId(), "TXN-1001");
        verify(orderRepository).save(paidOrder);
        verify(notificationService)
                .sendPaymentSucceeded("ORD-1", "TXN-1001");
    }

    @Test
    public void shouldRejectMissingOrderWithoutCallingLaterDependencies() {
        when(orderRepository.findById("ORD-404"))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception = Assert.expectThrows(
                IllegalArgumentException.class,
                () -> paymentService.pay("ORD-404")
        );

        Assert.assertEquals(exception.getMessage(), "Order not found: ORD-404");
        verify(orderRepository).findById("ORD-404");
        verify(orderRepository, never()).save(any(PaymentOrder.class));
        verifyNoInteractions(paymentGateway, notificationService);
    }
}
