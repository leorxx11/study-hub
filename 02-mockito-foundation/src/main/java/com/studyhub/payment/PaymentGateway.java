package com.studyhub.payment;

public interface PaymentGateway {
    PaymentResult charge(String orderId, int amountCents);
}
