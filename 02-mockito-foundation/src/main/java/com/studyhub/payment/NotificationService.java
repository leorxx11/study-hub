package com.studyhub.payment;

public interface NotificationService {
    void sendPaymentSucceeded(String orderId, String transactionId);
}
