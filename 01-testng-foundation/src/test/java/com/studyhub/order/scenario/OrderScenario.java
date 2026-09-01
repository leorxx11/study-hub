package com.studyhub.order.scenario;

import com.studyhub.order.OrderService;
import org.testng.ITest;
import org.testng.annotations.BeforeMethod;

/**
 * 所有订单场景共享的测试基础设施。
 */
public abstract class OrderScenario implements ITest {
    private final String scenarioName;
    protected OrderService orderService;

    protected OrderScenario(String scenarioName) {
        this.scenarioName = scenarioName;
    }

    @BeforeMethod(alwaysRun = true)
    public void setUp() {
        // 每个测试都从一个全新的服务开始，避免测试相互依赖。
        orderService = new OrderService();
    }

    @Override
    public String getTestName() {
        return scenarioName;
    }
}
