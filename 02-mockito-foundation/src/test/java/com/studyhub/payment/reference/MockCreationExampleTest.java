package com.studyhub.payment.reference;

import com.studyhub.payment.NotificationService;
import com.studyhub.payment.OrderRepository;
import com.studyhub.payment.PaymentGateway;
import com.studyhub.payment.PaymentOrder;
import com.studyhub.payment.PaymentResult;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.Optional;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockingDetails;
import static org.mockito.Mockito.verify;

/**
 * {@code mock()} 的可运行参考示例。
 */
public class MockCreationExampleTest {

    @Test
    public void shouldCreateAMockAndReturnAnEmptyOptionalByDefault() {
        OrderRepository repository = mock(OrderRepository.class);

        Assert.assertTrue(mockingDetails(repository).isMock());

        // 没有配置 when：不会查询数据库，而是返回 Mockito 的默认值。
        Optional<PaymentOrder> result = repository.findById("ORD-404");

        Assert.assertTrue(result.isEmpty());
        verify(repository).findById("ORD-404");
    }

    @Test
    public void shouldReturnNullForAnUnstubbedObjectResult() {
        PaymentGateway gateway = mock(PaymentGateway.class);

        // PaymentResult 是普通对象类型；没有配置 when 时，默认返回 null。
        PaymentResult result = gateway.charge("ORD-1", 350);

        Assert.assertNull(result);
        verify(gateway).charge("ORD-1", 350);
    }

    @Test
    public void shouldRecordAVoidMethodCallWithoutSendingARealNotification() {
        NotificationService notificationService = mock(NotificationService.class);

        // 调用会被记录，但没有真实通知系统，所以什么消息也不会发送。
        notificationService.sendPaymentSucceeded("ORD-1", "TXN-1001");

        verify(notificationService)
                .sendPaymentSucceeded("ORD-1", "TXN-1001");
    }
}
