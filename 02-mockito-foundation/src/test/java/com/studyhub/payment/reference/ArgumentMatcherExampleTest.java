package com.studyhub.payment.reference;

import com.studyhub.payment.PaymentGateway;
import com.studyhub.payment.PaymentResult;
import org.testng.Assert;
import org.testng.annotations.Test;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Mockito 参数匹配器的可运行参考示例。
 */
public class ArgumentMatcherExampleTest {

    @Test
    public void shouldMatchAnyNonNullOrderIdAndAnyAmount() {
        PaymentGateway gateway = mock(PaymentGateway.class);
        PaymentResult success = PaymentResult.success("TXN-ANY");

        when(gateway.charge(anyString(), anyInt()))
                .thenReturn(success);

        Assert.assertSame(gateway.charge("ORD-1", 350), success);
        Assert.assertSame(gateway.charge("ORD-2", 999), success);
    }

    @Test
    public void shouldCombineAnExactValueWithAMatcher() {
        PaymentGateway gateway = mock(PaymentGateway.class);
        PaymentResult success = PaymentResult.success("TXN-1001");

        when(gateway.charge(eq("ORD-1"), anyInt()))
                .thenReturn(success);

        PaymentResult matchingResult = gateway.charge("ORD-1", 350);
        PaymentResult unmatchedResult = gateway.charge("ORD-2", 350);

        Assert.assertSame(matchingResult, success);
        Assert.assertNull(unmatchedResult);
    }

    @Test
    public void shouldUseMatchersDuringVerification() {
        PaymentGateway gateway = mock(PaymentGateway.class);

        gateway.charge("ORD-1", 350);
        gateway.charge("ORD-2", 500);

        verify(gateway, times(2)).charge(anyString(), anyInt());
        verify(gateway).charge(eq("ORD-1"), eq(350));
    }
}
