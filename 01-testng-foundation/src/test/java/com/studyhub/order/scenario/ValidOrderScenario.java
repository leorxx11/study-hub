package com.studyhub.order.scenario;

import com.studyhub.order.Order;
import com.studyhub.order.OrderStatus;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;

/**
 * 一个合法创建订单的场景。
 */
public final class ValidOrderScenario extends OrderScenario {
    private final String productName;
    private final int quantity;
    private final int unitPriceCents;
    private final int availableStock;
    private final String expectedProductName;
    private final int expectedTotalAmountCents;

    public ValidOrderScenario(
            String scenarioName,
            String productName,
            int quantity,
            int unitPriceCents,
            int availableStock,
            String expectedProductName,
            int expectedTotalAmountCents
    ) {
        super(scenarioName);
        this.productName = productName;
        this.quantity = quantity;
        this.unitPriceCents = unitPriceCents;
        this.availableStock = availableStock;
        this.expectedProductName = expectedProductName;
        this.expectedTotalAmountCents = expectedTotalAmountCents;
    }

    @Test(
            groups = {"smoke", "regression"},
            description = "Valid input creates a pending order"
    )
    public void shouldCreatePendingOrderWhenInputIsValid() {
        Order order = orderService.createOrder(
                productName,
                quantity,
                unitPriceCents,
                availableStock
        );

        assertEquals(order.getId(), "ORD-1");
        assertEquals(order.getProductName(), expectedProductName);
        assertEquals(order.getQuantity(), quantity);
        assertEquals(order.getUnitPriceCents(), unitPriceCents);
        assertEquals(order.getTotalAmountCents(), expectedTotalAmountCents);
        assertEquals(order.getStatus(), OrderStatus.PENDING);
        assertEquals(orderService.getOrderCount(), 1);
    }
}
