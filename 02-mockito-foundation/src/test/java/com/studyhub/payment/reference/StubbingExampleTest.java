package com.studyhub.payment.reference;

import com.studyhub.payment.OrderRepository;
import com.studyhub.payment.PaymentGateway;
import com.studyhub.payment.PaymentOrder;
import com.studyhub.payment.PaymentResult;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.Optional;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * {@code when(...).thenReturn(...)} 的可运行参考示例。
 */
public class StubbingExampleTest {

    @Test
    public void shouldReturnTheConfiguredOrder() {
        OrderRepository repository = mock(OrderRepository.class);
        PaymentOrder expectedOrder = PaymentOrder.pending("ORD-1", 350);

        when(repository.findById("ORD-1"))
                .thenReturn(Optional.of(expectedOrder));

        Optional<PaymentOrder> actualResult = repository.findById("ORD-1");

        Assert.assertTrue(actualResult.isPresent());
        // orElseThrow() 取出里面的订单。
        // assertSame() 检查它们是不是同一个对象，而不仅仅是字段内容相同。
        Assert.assertSame(actualResult.orElseThrow(), expectedOrder);
    }

    @Test
    public void shouldUseTheStubOnlyWhenArgumentsMatch() {
        OrderRepository repository = mock(OrderRepository.class);
        PaymentOrder expectedOrder = PaymentOrder.pending("ORD-1", 350);

        when(repository.findById("ORD-1"))
                .thenReturn(Optional.of(expectedOrder));

        Optional<PaymentOrder> configuredResult = repository.findById("ORD-1");
        Optional<PaymentOrder> unmatchedResult = repository.findById("ORD-404");

        Assert.assertTrue(configuredResult.isPresent());
        Assert.assertTrue(unmatchedResult.isEmpty());
    }

    @Test
    public void shouldReturnTheConfiguredPaymentResult() {
        PaymentGateway gateway = mock(PaymentGateway.class);
        PaymentResult expectedResult = PaymentResult.success("TXN-1001");

        when(gateway.charge("ORD-1", 350))
                .thenReturn(expectedResult);

        PaymentResult actualResult = gateway.charge("ORD-1", 350);

        Assert.assertSame(actualResult, expectedResult);
        Assert.assertTrue(actualResult.isSuccessful());
        Assert.assertEquals(actualResult.getTransactionId(), "TXN-1001");
    }
}
