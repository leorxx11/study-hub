package com.studyhub.order;

/**
 * An order can only move forward through the business flow defined by
 * {@link OrderService}.
 */
public enum OrderStatus {
    PENDING,
    PAID,
    SHIPPED,
    COMPLETED,
    CANCELLED
}
