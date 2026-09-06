package com.studyhub.api;

public record Order(String id, Product product, int quantity, int totalAmountCents,
                    OrderStatus status) {
}
