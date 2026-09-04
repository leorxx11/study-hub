package com.studyhub.payment;

public final class PaymentOrder {
    private final String id;
    private final int amountCents;
    private final OrderStatus status;
    private final String transactionId;

    private PaymentOrder(
            String id,
            int amountCents,
            OrderStatus status,
            String transactionId
    ) {
        this.id = id;
        this.amountCents = amountCents;
        this.status = status;
        this.transactionId = transactionId;
    }

    public static PaymentOrder pending(String id, int amountCents) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("Order id must not be blank");
        }
        if (amountCents <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }
        return new PaymentOrder(id, amountCents, OrderStatus.PENDING, null);
    }

    public PaymentOrder markPaid(String transactionId) {
        if (status != OrderStatus.PENDING) {
            throw new IllegalStateException("Only pending orders can be paid");
        }
        if (transactionId == null || transactionId.isBlank()) {
            throw new IllegalArgumentException("Transaction id must not be blank");
        }
        return new PaymentOrder(id, amountCents, OrderStatus.PAID, transactionId);
    }

    public String getId() {
        return id;
    }

    public int getAmountCents() {
        return amountCents;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public String getTransactionId() {
        return transactionId;
    }
}
