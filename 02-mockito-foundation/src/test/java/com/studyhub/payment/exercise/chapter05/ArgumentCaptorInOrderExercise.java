package com.studyhub.payment.exercise.chapter05;

import com.studyhub.payment.*;
import org.mockito.*;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.Optional;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * 第五章练习：捕获真实传参，并验证多个依赖的调用顺序。
 *
 * <p>在 IntelliJ IDEA 中单独运行本类。只完成 TODO，不修改业务代码。</p>
 */
public class ArgumentCaptorInOrderExercise {
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

    // TODO：使用 @Captor 标记 PaymentOrder 参数捕获器。
    @Captor
    private ArgumentCaptor<PaymentOrder> savedOrderCaptor;

    private AutoCloseable mocks;

    @BeforeMethod
    public void setUp() {
        // TODO：先清空被测对象，再初始化 Mockito 注解。
        paymentService = null;
        mocks = MockitoAnnotations.openMocks(this);
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown() throws Exception {
        // TODO：关闭 Mockito 注解上下文。
        mocks.close();
    }

    @Test
    public void shouldCaptureTheSavedOrder() {
        // TODO：
        // 1. 仓库返回 ORD-5、金额 880 的 PENDING 订单。
        when(orderRepository.findById("ORD-5"))
                .thenReturn(Optional.of(PaymentOrder.pending("ORD-5", 880)));
        // 2. 网关返回交易号 TXN-5001 的成功结果。
        when(paymentGateway.charge("ORD-5", 880))
                .thenReturn(PaymentResult.success("TXN-5001"));
        // 3. 调用 paymentService.pay("ORD-5") 并保存返回订单。
        PaymentOrder pay = paymentService.pay("ORD-5");
        // 4. verify 仓库的 save()，使用 savedOrderCaptor.capture() 捕获实参。
        verify(orderRepository).save(savedOrderCaptor.capture());
        // 5. 取得捕获值，断言它就是返回订单。
        PaymentOrder capturedOrder = savedOrderCaptor.getValue();
        Assert.assertEquals(capturedOrder, pay);
        // 6. 断言订单号、金额、状态和交易号。
        Assert.assertEquals(capturedOrder.getId(), "ORD-5");
        Assert.assertEquals(capturedOrder.getAmountCents(), 880);
        Assert.assertEquals(capturedOrder.getStatus(), OrderStatus.PAID);
        Assert.assertEquals(capturedOrder.getTransactionId(), "TXN-5001");
    }

    @Test
    public void shouldCallDependenciesInOrder() {
        // TODO：
        // 1. 为 ORD-6、金额 990 配置查询结果和成功扣款结果 TXN-6001。
        PaymentOrder pending = PaymentOrder.pending("ORD-6", 990);
        when(orderRepository.findById("ORD-6"))
                .thenReturn(Optional.of(pending));
        when(paymentGateway.charge("ORD-6", 990))
                .thenReturn(PaymentResult.success("TXN-6001"));
        // 2. 调用 paymentService.pay("ORD-6")。
        PaymentOrder pay = paymentService.pay("ORD-6");
        // 3. 创建包含仓库、网关和通知服务的 InOrder。
        InOrder inOrder = Mockito.inOrder(orderRepository, paymentGateway, notificationService);
        // 4. 依次验证 findById、charge、save、sendPaymentSucceeded。
        inOrder.verify(orderRepository).findById("ORD-6");
        inOrder.verify(paymentGateway).charge("ORD-6", 990);
        inOrder.verify(orderRepository).save(pay);
        inOrder.verify(notificationService).sendPaymentSucceeded("ORD-6", "TXN-6001");
        // 5. 验证没有剩余的未检查调用。
        inOrder.verifyNoMoreInteractions();
    }
}
