package com.studyhub.payment.exercise.chapter02;

import com.studyhub.payment.PaymentGateway;
import com.studyhub.payment.PaymentResult;
import org.testng.Assert;
import org.testng.annotations.Test;


import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * 第二章练习：参数匹配器与调用次数。
 *
 * <p>在 IntelliJ IDEA 中单独运行本类。只完成 TODO，不修改业务代码。</p>
 */
public class ArgumentMatcherExercise {

    @Test
    public void shouldApplyStubOnlyToTheExpectedOrder() {
        // TODO：
        // 1. 手动创建 PaymentGateway Mock。
        PaymentGateway paymentGateway = mock(PaymentGateway.class);
        // 2. 准备交易号为 TXN-MATCHED 的成功结果。
        PaymentResult successResult = PaymentResult.success("TXN-MATCHED");
        // 3. 使用 eq("ORD-1") 和 anyInt()：ORD-1 以任意金额扣款都返回该结果。
        when(paymentGateway.charge(eq("ORD-1"), anyInt())).thenReturn(successResult);
        // 4. 分别调用 charge("ORD-1", 350) 和 charge("ORD-2", 350)。
        PaymentResult result1 = paymentGateway.charge("ORD-1", 350);
        PaymentResult result2 = paymentGateway.charge("ORD-2", 350);
        // 5. 断言 ORD-1 返回预设结果，ORD-2 返回 null。
        Assert.assertEquals(result1, successResult);
        Assert.assertNull(result2);
        // 6. 验证这两次调用各发生一次。
        verify(paymentGateway).charge("ORD-1", 350);
        verify(paymentGateway).charge("ORD-2", 350);
    }

    @Test
    public void shouldVerifyCallsWithMatchersAndCounts() {
        // TODO：
        // 1. 手动创建 PaymentGateway Mock。
        PaymentGateway paymentGateway = mock(PaymentGateway.class);
        // 2. 调用 ORD-1 两次，金额分别为 350 和 500；调用 ORD-2 一次，金额为 800。
        paymentGateway.charge("ORD-1", 350);
        paymentGateway.charge("ORD-1", 500);
        paymentGateway.charge("ORD-2", 800);
        // 3. 使用 anyString() 和 anyInt() 验证总调用次数为 3。
        verify(paymentGateway, times(3)).charge(anyString(), anyInt());
        // 4. 使用 eq("ORD-1") 和 anyInt() 验证 ORD-1 的调用次数为 2。
        verify(paymentGateway, times(2)).charge(eq("ORD-1"), anyInt());
        // 5. 验证不存在 charge("ORD-404", 350) 调用。
        verify(paymentGateway, never()).charge(eq("ORD-404"), eq(350));
    }
}
