package com.studyhub.order.capstone;

import com.studyhub.order.Order;
import com.studyhub.order.OrderService;
import com.studyhub.order.OrderStatus;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

/**
 * 综合练习第一关：订单创建。
 *
 * <p>只完成 TODO，不需要改动 OrderService 业务代码。</p>
 */
public class OrderCreationTest {
    private OrderService orderService;

    @BeforeMethod(alwaysRun = true)
    public void setUp() {
        // TODO：每次测试创建新的 OrderService。
        orderService = new OrderService();
    }

    @DataProvider(name = "validOrders")
    public Object[][] validOrders() {
        // TODO：提供三组有效订单数据。
        return new Object[][]{
                {" Notebook ","Notebook",1,20,10},
                {"Notebook","Notebook",3,20,10},
                {"pen","pen",10,50,100}
        };
    }

    @Test(
            dataProvider = "validOrders",
            groups = {"smoke", "regression"}
    )
    public void shouldCreatePendingOrder(
            String inputProductName,
            String expectedProductName,
            int quantity,
            int unitPriceCents,
            int availableStock
    ) {
        // TODO：创建订单并断言订单号、商品名、数量、单价、总价、状态和订单数量。
        Order order = orderService.createOrder(
                inputProductName,
                quantity,
                unitPriceCents,
                availableStock
        );

        Assert.assertEquals(order.getId(),"ORD-1");
        Assert.assertEquals(order.getProductName(),expectedProductName);
        Assert.assertEquals(order.getQuantity(),quantity);
        Assert.assertEquals(order.getUnitPriceCents(),unitPriceCents);
        Assert.assertEquals(order.getTotalAmountCents(),quantity * unitPriceCents);
        Assert.assertEquals(order.getStatus(), OrderStatus.PENDING);
        Assert.assertEquals(orderService.getOrderCount(),1);
    }

    @DataProvider(name = "invalidOrderInputs")
    public Object[][] invalidOrderInputs() {
        // TODO：提供商品名为空白、数量 0、数量 11、单价 0、库存 -1 五组数据。
        // 每行最后一个参数保存期望的异常消息。
        return new Object[][]{
                {"",1,20,10,"Product name must not be blank"},
                {"Notebook",0,20,10,"Quantity must be between 1 and 10"},
                {"Notebook",11,20,10,"Quantity must be between 1 and 10"},
                {"Notebook",1,0,10,"Unit price must be greater than zero"},
                {"Notebook",1,20,-1,"Available stock must not be negative"},
        };
    }

    @Test(
            dataProvider = "invalidOrderInputs",
            groups = "regression"
    )
    public void shouldRejectInvalidOrderInput(
            String productName,
            int quantity,
            int unitPriceCents,
            int availableStock,
            String expectedMessage
    ) {
        // TODO：使用 Assert.expectThrows 验证 IllegalArgumentException。
        // TODO：断言异常消息，并确认失败后订单数量仍为 0。
        IllegalArgumentException exception = Assert.expectThrows(
                IllegalArgumentException.class,
                () -> orderService.createOrder(
                        productName,
                        quantity,
                        unitPriceCents,
                        availableStock
                )
        );

        Assert.assertEquals(exception.getMessage(),expectedMessage);
        Assert.assertEquals(orderService.getOrderCount(),0);

    }

    @Test(groups = "regression")
    public void shouldRejectOrderWhenStockIsInsufficient() {
        // TODO：创建“数量 2、库存 1”的订单并验证 IllegalStateException。
        // TODO：断言消息为 Insufficient stock，并确认订单数量仍为 0。

        IllegalStateException exception = Assert.expectThrows(
                IllegalStateException.class,
                () -> orderService.createOrder("pen", 2, 5, 1)
        );
        Assert.assertEquals(exception.getMessage(),"Insufficient stock");
        Assert.assertEquals(orderService.getOrderCount(),0);

    }
}
