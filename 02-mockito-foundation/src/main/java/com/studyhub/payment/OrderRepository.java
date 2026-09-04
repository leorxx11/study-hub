package com.studyhub.payment;

import java.util.Optional;

public interface OrderRepository {
    Optional<PaymentOrder> findById(String orderId);

    void save(PaymentOrder order);
}
