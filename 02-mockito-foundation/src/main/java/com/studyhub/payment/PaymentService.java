package com.studyhub.payment;

public final class PaymentService {
    private final OrderRepository orderRepository;
    private final PaymentGateway paymentGateway;
    private final NotificationService notificationService;

    public PaymentService(
            OrderRepository orderRepository,
            PaymentGateway paymentGateway,
            NotificationService notificationService
    ) {
        this.orderRepository = orderRepository;
        this.paymentGateway = paymentGateway;
        this.notificationService = notificationService;
    }

    public PaymentOrder pay(String orderId) {
        if (orderId == null || orderId.isBlank()) {
            throw new IllegalArgumentException("Order id must not be blank");
        }

        PaymentOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Only pending orders can be paid");
        }

        PaymentResult paymentResult = paymentGateway.charge(
                order.getId(),
                order.getAmountCents()
        );
        if (!paymentResult.isSuccessful()) {
            throw new PaymentFailedException(
                    "Payment failed: " + paymentResult.getFailureReason()
            );
        }

        PaymentOrder paidOrder = order.markPaid(paymentResult.getTransactionId());
        orderRepository.save(paidOrder);
        notificationService.sendPaymentSucceeded(
                paidOrder.getId(),
                paidOrder.getTransactionId()
        );
        return paidOrder;
    }
}
