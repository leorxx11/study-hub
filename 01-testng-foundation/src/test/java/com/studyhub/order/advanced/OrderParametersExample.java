package com.studyhub.order.advanced;

import com.studyhub.order.Order;
import com.studyhub.order.OrderService;
import com.studyhub.order.OrderStatus;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Optional;
import org.testng.annotations.Parameters;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;

/**
 * TestNG {@link Parameters} 和 {@link Optional} 的参考示例。
 *
 * <p>参数主要来自 {@code testng-parameters.xml}；当 XML 没有提供某个参数时，
 * {@code @Optional} 提供可预测的默认值。</p>
 */
public class OrderParametersExample {
    private OrderService orderService;

    @BeforeMethod(alwaysRun = true)
    public void setUp() {
        orderService = new OrderService();
    }

    @Test(
            groups = {"smoke", "regression"},
            description = "Order input can be supplied by testng.xml parameters"
    )
    @Parameters({"product-name", "quantity", "unit-price-cents", "available-stock"})
    public void shouldCreateOrderFromXmlParameters(
            @Optional("Notebook") String productName,
            @Optional("1") int quantity,
            @Optional("350") int unitPriceCents,
            @Optional("10") int availableStock
    ) {
        // testng-parameters.xml 在 <test> 中把 suite 级别的 quantity=1 覆盖为 2。
        assertEquals(quantity, 2, "<test> 参数应覆盖 <suite> 参数");
        // XML 故意未提供 unit-price-cents，因此这里使用 @Optional 的默认值。
        assertEquals(unitPriceCents, 350, "缺失参数应使用 @Optional 默认值");

        Order order = orderService.createOrder(
                productName,
                quantity,
                unitPriceCents,
                availableStock
        );

        assertEquals(order.getProductName(), "Notebook");
        assertEquals(order.getQuantity(), quantity);
        assertEquals(order.getUnitPriceCents(), unitPriceCents);
        assertEquals(order.getTotalAmountCents(), quantity * unitPriceCents);
        assertEquals(order.getStatus(), OrderStatus.PENDING);
    }
}
