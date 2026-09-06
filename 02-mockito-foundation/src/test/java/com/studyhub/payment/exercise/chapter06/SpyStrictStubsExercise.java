package com.studyhub.payment.exercise.chapter06;

import com.studyhub.payment.*;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoSession;
import org.mockito.quality.Strictness;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.Optional;

import static org.mockito.Mockito.*;

/**
 * 第六章练习：使用 spy 保留真实行为，并用严格模式检查桩配置。
 *
 * <p>在 IntelliJ IDEA 中单独运行本类。只完成 TODO，不修改业务代码。</p>
 */
public class SpyStrictStubsExercise {
    // TODO：使用 @Mock 标记三个外部依赖。
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private PaymentGateway paymentGateway;
    @Mock
    private NotificationService notificationService;

    // TODO：使用 @InjectMocks 标记真实的 PaymentService。
    @InjectMocks
    private PaymentService paymentService;

    private MockitoSession mockitoSession;

    @BeforeMethod
    public void setUp() {
        // TODO：
        // 1. 清空 paymentService。
        paymentService = null;
        // 2. 创建 MockitoSession，初始化当前对象上的注解。
        // 3. 设置 Strictness.STRICT_STUBS，并启动会话。
        mockitoSession = mockitoSession()
                .initMocks(this)
                .strictness(Strictness.STRICT_STUBS)
                .startMocking();

    }

    @AfterMethod(alwaysRun = true)
    public void tearDown() {
        // TODO：结束 MockitoSession，让严格模式检查本次测试的桩。
        mockitoSession.finishMocking();
    }

    @Test
    public void shouldKeepRealBehaviorExceptForOneStubbedMethod() {
        // TODO：
        // 1. 使用 spy(new PaymentAttemptCounter()) 创建间谍对象。
        PaymentAttemptCounter spy = spy(new PaymentAttemptCounter());
        // 2. 调用 recordAttempt("ORD-7")，断言返回 ORD-7#1。
        String firstAttempt = spy.recordAttempt("ORD-7");
        Assert.assertEquals(firstAttempt, "ORD-7#1");
        // 3. 使用 doReturn("SKIPPED") 为 recordAttempt("ORD-8") 配置桩。
        doReturn("SKIPPED")
                .when(spy)
                .recordAttempt("ORD-8");
        // 4. 调用 ORD-8，断言返回 SKIPPED，并确认真实计数仍为 1。
        String secondAttempt = spy.recordAttempt("ORD-8");
        Assert.assertEquals(secondAttempt, "SKIPPED");
        Assert.assertEquals(spy.getAttempts(), 1);
        // 5. 验证两次 recordAttempt 调用。
        verify(spy).recordAttempt("ORD-7");
        verify(spy).recordAttempt("ORD-8");
    }

    @Test
    public void shouldFinishWithNoUnusedStubs() {
        // TODO：
        // 1. 为 ORD-7、金额 720 配置仓库查询结果。
        PaymentOrder pending = PaymentOrder.pending("ORD-7", 720);
        when(orderRepository.findById("ORD-7"))
                .thenReturn(Optional.of(pending));
        // 2. 为同一订单配置交易号 TXN-7001 的成功扣款结果。
        when(paymentGateway.charge("ORD-7", 720))
                .thenReturn(PaymentResult.success("TXN-7001"));
        // 3. 调用 paymentService.pay("ORD-7")。
        PaymentOrder pay = paymentService.pay("ORD-7");
        // 4. 断言支付结果，并验证保存和通知。
        Assert.assertEquals(pay.getStatus(), OrderStatus.PAID);
        Assert.assertEquals(pay.getTransactionId(), "TXN-7001");
        verify(orderRepository).save(pay);
        verify(notificationService).sendPaymentSucceeded("ORD-7", "TXN-7001");
        // 5. 临时增加一个不会被调用的 when(...).thenReturn(...)，运行并观察
        //    UnnecessaryStubbingException；观察后删除这条多余桩，让测试恢复通过。
//        when(orderRepository.findById("ORD-999"))
//                .thenReturn(Optional.empty());
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
