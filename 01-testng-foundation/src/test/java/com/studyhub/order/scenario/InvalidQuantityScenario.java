package com.studyhub.order.scenario;

import org.testng.annotations.Test;

/**
 * 一个非法购买数量的场景。
 */
public final class InvalidQuantityScenario extends OrderScenario {
    private final int invalidQuantity;

    public InvalidQuantityScenario(String scenarioName, int invalidQuantity) {
        super(scenarioName);
        this.invalidQuantity = invalidQuantity;
    }

    @Test(
            groups = {"regression"},
            expectedExceptions = IllegalArgumentException.class,
            expectedExceptionsMessageRegExp = "Quantity must be between 1 and 10",
            description = "Quantity outside the allowed range is rejected"
    )
    public void shouldRejectQuantityOutsideAllowedRange() {
        orderService.createOrder("Notebook", invalidQuantity, 350, 20);
    }
}
