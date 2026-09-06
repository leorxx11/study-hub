package com.studyhub.payment.exercise.chapter04;

import com.studyhub.payment.*;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 第四章练习：使用 Mockito 注解管理依赖，并用 TestNG 生命周期隔离测试。
 *
 * <p>在 IntelliJ IDEA 中单独运行本类。只完成 TODO，不修改业务代码。</p>
 */
public class AnnotationInjectionExercise {
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

    private AutoCloseable mocks;

    @BeforeMethod
    public void setUp() {
        // TODO：先清空被测对象，再初始化当前测试对象上的 Mockito 注解，并保存返回值。
        paymentService = null;
        mocks = MockitoAnnotations.openMocks(this);
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown() throws Exception {
        // TODO：关闭 setUp 中创建的 Mockito 注解上下文。
        mocks.close();
    }

    @Test
    public void shouldPayPendingOrder() {
        // TODO：
        // 1. 仓库返回 ORD-1、金额 350 的 PENDING 订单。
        PaymentOrder penging = PaymentOrder.pending("ORD-1", 350);
        when(orderRepository.findById("ORD-1"))
                .thenReturn(Optional.of(penging));
        // 2. 网关返回交易号 TXN-1001 的成功结果。
        when(paymentGateway.charge("ORD-1", 350))
                .thenReturn(PaymentResult.success("TXN-1001"));
        // 3. 调用 paymentService.pay("ORD-1")。
        PaymentOrder pay = paymentService.pay("ORD-1");
        // 4. 断言订单状态和交易号。
        Assert.assertEquals(pay.getStatus(), OrderStatus.PAID);
        Assert.assertEquals(pay.getTransactionId(), "TXN-1001");
        // 5. 验证仓库保存订单，并发送支付成功通知。
        verify(orderRepository).save(pay);
        verify(notificationService).sendPaymentSucceeded("ORD-1", "TXN-1001");
    }

    @Test
    public void shouldRejectMissingOrder() {
        // TODO：
        // 1. 仓库查询 ORD-404 时返回 Optional.empty()。
        when(orderRepository.findById("ORD-404"))
                .thenReturn(Optional.empty());
        // 2. 断言 paymentService.pay("ORD-404") 抛出 IllegalArgumentException。
        IllegalArgumentException exception = Assert.expectThrows(
                IllegalArgumentException.class,
                () -> paymentService.pay("ORD-404")
        );
        // 3. 断言异常消息为 Order not found: ORD-404。
        Assert.assertEquals(exception.getMessage(), "Order not found: ORD-404");
        // 4. 验证没有调用支付网关，也没有发送通知或保存订单。
        verifyNoInteractions(paymentGateway, notificationService);
        verify(orderRepository, never()).save(any(PaymentOrder.class));
    }
}
