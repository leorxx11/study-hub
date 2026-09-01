package com.studyhub.order;

import com.studyhub.order.scenario.InvalidQuantityScenario;
import com.studyhub.order.scenario.ValidOrderScenario;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Factory;

/**
 * TestNG 的 Factory 入口。
 *
 * <p>{@code testng.xml} 只需要引用这个类；它负责把测试数据转换成具体的场景测试对象。</p>
 */
public class CreateOrderExampleTest {

    @DataProvider(name = "validOrderInputs")
    public static Object[][] validOrderInputs() {
        return new Object[][]{
                {"创建单件 Notebook 订单", "Notebook", 1, 350, 1, "Notebook", 350},
                {"创建会去除首尾空格的订单", " Notebook ", 2, 350, 5, "Notebook", 700},
                {"创建数量上限为 10 的订单", "Pen", 10, 1, 10, "Pen", 10}
        };
    }

    @Factory(dataProvider = "validOrderInputs")
    public Object[] createValidOrderScenarios(
            String scenarioName,
            String productName,
            int quantity,
            int unitPriceCents,
            int availableStock,
            String expectedProductName,
            int expectedTotalAmountCents
    ) {
        return new Object[]{
                new ValidOrderScenario(
                        scenarioName,
                        productName,
                        quantity,
                        unitPriceCents,
                        availableStock,
                        expectedProductName,
                        expectedTotalAmountCents
                )
        };
    }

    @DataProvider(name = "invalidQuantities")
    public static Object[][] invalidQuantities() {
        return new Object[][]{
                {0},
                {OrderService.MAX_QUANTITY_PER_ORDER + 1}
        };
    }

    @Factory(dataProvider = "invalidQuantities")
    public Object[] createInvalidQuantityScenarios(int invalidQuantity) {
        String scenarioName = "拒绝数量为 " + invalidQuantity + " 的订单";
        return new Object[]{new InvalidQuantityScenario(scenarioName, invalidQuantity)};
    }
}
