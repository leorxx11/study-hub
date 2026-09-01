package com.studyhub.order;

/**
 * Immutable view of an order.
 */

public final class Order {
    private final String id;
    private final String productName;
    private final int quantity;
    private final int unitPriceCents;
    private final int totalAmountCents;
    private final OrderStatus status;

    Order(
            String id,
            String productName,
            int quantity,
            int unitPriceCents,
            OrderStatus status
    ) {
        this.id = id;
        this.productName = productName;
        this.quantity = quantity;
        this.unitPriceCents = unitPriceCents;
        this.totalAmountCents = quantity * unitPriceCents;
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public String getProductName() {
        return productName;
    }

    public int getQuantity() {
        return quantity;
    }

    public int getUnitPriceCents() {
        return unitPriceCents;
    }

    public int getTotalAmountCents() {
        return totalAmountCents;
    }

    public OrderStatus getStatus() {
        return status;
    }
}
