package com.studyhub.payment.exercise.chapter07;

import com.studyhub.payment.*;
import org.mockito.*;
import org.mockito.quality.Strictness;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.Optional;

import static org.mockito.Mockito.*;

/**
 * 第七章综合练习：独立完成 PaymentService 的主要成功与失败路径测试。
 *
 * <p>每个测试完成后删除对应的 {@code Assert.fail("TODO")}。</p>
 */
public class PaymentServiceCapstoneTest {
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

    private MockitoSession mockitoSession;

    @BeforeMethod
    public void setUp() {
        paymentService = null;
        mockitoSession = org.mockito.Mockito.mockitoSession()
                .initMocks(this)
                .strictness(Strictness.STRICT_STUBS)
                .startMocking();
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown() {
        mockitoSession.finishMocking();
    }

    @Test
    public void shouldPayPendingOrderAndPersistExpectedResult() {
        // TODO：
        // 1. 仓库返回 ORD-10、金额 1500 的 PENDING 订单。
        PaymentOrder pending = PaymentOrder.pending("ORD-10", 1500);
        when(orderRepository.findById("ORD-10"))
                .thenReturn(Optional.of(pending));
        // 2. 网关返回交易号 TXN-10001 的成功结果。
        when(paymentGateway.charge("ORD-10", 1500))
                .thenReturn(PaymentResult.success("TXN-10001"));
        // 3. 调用 paymentService.pay("ORD-10")。
        PaymentOrder pay = paymentService.pay("ORD-10");
        // 4. 断言返回订单的订单号、金额、状态和交易号。
        Assert.assertEquals(pay.getId(), "ORD-10");
        Assert.assertEquals(pay.getAmountCents(), 1500);
        Assert.assertEquals(pay.getStatus(), OrderStatus.PAID);
        Assert.assertEquals(pay.getTransactionId(), "TXN-10001");
        // 5. 捕获传给 save() 的订单，确认它就是方法返回的订单，并再次断言字段。
        verify(orderRepository).save(savedOrderCaptor.capture());
        PaymentOrder capturedOrder = savedOrderCaptor.getValue();
        Assert.assertSame(capturedOrder, pay);
        Assert.assertEquals(capturedOrder.getId(), "ORD-10");
        Assert.assertEquals(capturedOrder.getAmountCents(), 1500);
        Assert.assertEquals(capturedOrder.getStatus(), OrderStatus.PAID);
        Assert.assertEquals(capturedOrder.getTransactionId(), "TXN-10001");
        // 6. 使用 InOrder 验证 findById、charge、save、sendPaymentSucceeded 的顺序。
        InOrder inOrder = inOrder(orderRepository, paymentGateway,notificationService);
        inOrder.verify(orderRepository).findById("ORD-10");
        inOrder.verify(paymentGateway).charge("ORD-10", 1500);
        inOrder.verify(orderRepository).save(pay);
        inOrder.verify(notificationService).sendPaymentSucceeded("ORD-10", "TXN-10001");
        // 7. 确认没有剩余的未验证调用。
        inOrder.verifyNoMoreInteractions();
//        Assert.fail("TODO：完成支付成功场景");
    }

    @Test
    public void shouldRejectMissingOrderWithoutCallingPaymentDependencies() {
        // TODO：
        // 1. 仓库查询 ORD-404 时返回 Optional.empty()。
        when(orderRepository.findById("ORD-404"))
                .thenReturn(Optional.empty());
        // 2. 断言 pay("ORD-404") 抛出 IllegalArgumentException。
        IllegalArgumentException e = Assert.expectThrows(IllegalArgumentException.class,
                () -> paymentService.pay("ORD-404"));
        // 3. 断言异常消息为 Order not found: ORD-404。
        Assert.assertEquals(e.getMessage(), "Order not found: ORD-404");
        // 4. 验证仓库查询发生一次，但没有保存订单。
        verify(orderRepository).findById("ORD-404");
        verify(orderRepository, never()).save(any(PaymentOrder.class));
        // 5. 验证支付网关和通知服务没有发生任何调用。
        verifyNoInteractions(paymentGateway, notificationService);
//        Assert.fail("TODO：完成订单不存在场景");
    }

    @Test
    public void shouldRejectAnAlreadyPaidOrder() {
        // TODO：
        // 1. 使用 PaymentOrder.pending("ORD-11", 2000).markPaid("TXN-OLD") 创建已支付订单。
        PaymentOrder pay = PaymentOrder.pending("ORD-11", 2000).markPaid("TXN-OLD");
        // 2. 仓库查询 ORD-11 时返回该订单。
        when(orderRepository.findById("ORD-11")).thenReturn(Optional.of(pay));
        // 3. 断言 pay("ORD-11") 抛出 IllegalStateException。
        IllegalStateException e = Assert.expectThrows(IllegalStateException.class,
                () -> paymentService.pay("ORD-11"));
        // 4. 断言异常消息为 Only pending orders can be paid。
        Assert.assertEquals(e.getMessage(), "Only pending orders can be paid");
        // 5. 验证没有扣款、保存或发送通知。
        verifyNoInteractions(paymentGateway, notificationService);
        verify(orderRepository, never()).save(any(PaymentOrder.class));
//        Assert.fail("TODO：完成订单状态错误场景");
    }

    @Test
    public void shouldNotSaveOrNotifyWhenGatewayDeclinesPayment() {
        // TODO：
        // 1. 仓库返回 ORD-12、金额 2600 的 PENDING 订单。
        PaymentOrder pending = PaymentOrder.pending("ORD-12", 2600);
        when(orderRepository.findById("ORD-12"))
                .thenReturn(Optional.of(pending));
        // 2. 网关返回 PaymentResult.failure("Card declined")。
        when(paymentGateway.charge("ORD-12", 2600))
                .thenReturn(PaymentResult.failure("Card declined"));
        // 3. 断言 pay("ORD-12") 抛出 PaymentFailedException。
        PaymentFailedException e = Assert.expectThrows(PaymentFailedException.class,
                () -> paymentService.pay("ORD-12"));
        // 4. 断言异常消息为 Payment failed: Card declined。
        Assert.assertEquals(e.getMessage(), "Payment failed: Card declined");
        // 5. 验证查询与扣款各发生一次。
        verify(orderRepository).findById("ORD-12");
        verify(paymentGateway).charge("ORD-12", 2600);
        // 6. 验证没有保存订单，也没有调用通知服务。
        verify(orderRepository, never()).save(any(PaymentOrder.class));
        verifyNoInteractions(notificationService);
//        Assert.fail("TODO：完成支付网关拒绝场景");
    }
}
