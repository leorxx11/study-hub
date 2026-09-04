package com.studyhub.payment;

public final class PaymentResult {
    private final boolean successful;
    private final String transactionId;
    private final String failureReason;

    private PaymentResult(boolean successful, String transactionId, String failureReason) {
        this.successful = successful;
        this.transactionId = transactionId;
        this.failureReason = failureReason;
    }

    public static PaymentResult success(String transactionId) {
        if (transactionId == null || transactionId.isBlank()) {
            throw new IllegalArgumentException("Transaction id must not be blank");
        }
        return new PaymentResult(true, transactionId, null);
    }

    public static PaymentResult failure(String reason) {
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Failure reason must not be blank");
        }
        return new PaymentResult(false, null, reason);
    }

    public boolean isSuccessful() {
        return successful;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public String getFailureReason() {
        return failureReason;
    }
}
