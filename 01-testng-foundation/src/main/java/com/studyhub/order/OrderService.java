package com.studyhub.order;

import java.util.HashMap;
import java.util.Map;

/**
 * A deliberately small in-memory order service for the TestNG foundation
 * exercises. It has no database, network, clock, or external dependencies.
 */
public final class OrderService {
    public static final int MAX_QUANTITY_PER_ORDER = 10;

    private final Map<String, Order> orders = new HashMap<>();
    private int nextOrderNumber = 1;

    /**
     * Creates a pending order when all input and inventory rules are satisfied.
     * Monetary values are expressed in cents to avoid floating-point rounding.
     */
    public Order createOrder(
            String productName,
            int quantity,
            int unitPriceCents,
            int availableStock
    ) {
        validateProductName(productName);
        validateQuantity(quantity);
        validateUnitPrice(unitPriceCents);
        validateAvailableStock(availableStock);

        if (availableStock < quantity) {
            throw new IllegalStateException("Insufficient stock");
        }

        String orderId = "ORD-" + nextOrderNumber++;
        Order order = new Order(
                orderId,
                productName.trim(),
                quantity,
                unitPriceCents,
                OrderStatus.PENDING
        );
        orders.put(orderId, order);
        return order;
    }

    /**
     * Returns the current order snapshot for an existing order id.
     */
    public Order getOrder(String orderId) {
        return requireOrder(orderId);
    }

    /**
     * Moves a pending order to paid.
     */
    public Order pay(String orderId) {
        return changeStatus(orderId, OrderStatus.PENDING, OrderStatus.PAID);
    }

    /**
     * Moves a paid order to shipped.
     */
    public Order ship(String orderId) {
        return changeStatus(orderId, OrderStatus.PAID, OrderStatus.SHIPPED);
    }

    /**
     * Moves a shipped order to completed.
     */
    public Order complete(String orderId) {
        return changeStatus(orderId, OrderStatus.SHIPPED, OrderStatus.COMPLETED);
    }

    /**
     * Cancels an order only before it is paid.
     */
    public Order cancel(String orderId) {
        return changeStatus(orderId, OrderStatus.PENDING, OrderStatus.CANCELLED);
    }

    public int getOrderCount() {
        return orders.size();
    }

    private Order changeStatus(String orderId, OrderStatus expectedStatus, OrderStatus nextStatus) {
        Order currentOrder = requireOrder(orderId);
        if (currentOrder.getStatus() != expectedStatus) {
            throw new IllegalStateException(
                    "Cannot change order from " + currentOrder.getStatus() + " to " + nextStatus
            );
        }

        Order updatedOrder = new Order(
                currentOrder.getId(),
                currentOrder.getProductName(),
                currentOrder.getQuantity(),
                currentOrder.getUnitPriceCents(),
                nextStatus
        );
        orders.put(orderId, updatedOrder);
        return updatedOrder;
    }

    private Order requireOrder(String orderId) {
        if (orderId == null || orderId.isBlank()) {
            throw new IllegalArgumentException("Order id must not be blank");
        }

        Order order = orders.get(orderId);
        if (order == null) {
            throw new IllegalArgumentException("Order not found: " + orderId);
        }
        return order;
    }

    private void validateProductName(String productName) {
        if (productName == null || productName.isBlank()) {
            throw new IllegalArgumentException("Product name must not be blank");
        }
    }

    private void validateQuantity(int quantity) {
        if (quantity <= 0 || quantity > MAX_QUANTITY_PER_ORDER) {
            throw new IllegalArgumentException(
                    "Quantity must be between 1 and " + MAX_QUANTITY_PER_ORDER
            );
        }
    }

    private void validateUnitPrice(int unitPriceCents) {
        if (unitPriceCents <= 0) {
            throw new IllegalArgumentException("Unit price must be greater than zero");
        }
    }

    private void validateAvailableStock(int availableStock) {
        if (availableStock < 0) {
            throw new IllegalArgumentException("Available stock must not be negative");
        }
    }
}
