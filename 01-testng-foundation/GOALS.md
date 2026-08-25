# 第一阶段 · TestNG 测试基础

> 状态：Not Started

## 阶段目标

能够使用 TestNG 为一个简单的 Java 服务独立设计、编写并运行测试。

## 范围

- 测试用例设计：正常、异常、边界与状态流转。
- Maven 中引入并运行 TestNG。
- `@Test`、断言与异常测试。
- `@BeforeMethod` / `@AfterMethod` 生命周期。
- `@DataProvider` 数据驱动。
- groups、priority 与 `testng.xml` 的基础使用。

## 本阶段产物

- 一个最小 Maven + TestNG 项目。
- `OrderService`（或等价业务类）的测试用例。
- 可分别执行的 smoke 与 regression 测试组。

## 完成标准

- 能说清每个测试覆盖的业务风险。
- 测试覆盖至少一个正常、异常和边界场景。
- 测试之间相互独立，不依赖执行顺序或共享数据。
- 使用 DataProvider 覆盖多组输入，并能通过 `mvn test` 稳定运行。
- 能用 `testng.xml` 执行一个测试组。

## 暂不学习

Mockito、RestAssured、Selenium、JMeter 与 CI/CD；本阶段只把 TestNG 基础打牢。

## 第一步

1. 确认 Java、Maven、IDEA 与 Git 可用。
2. 用已有 JUnit 笔记复习断言、生命周期和参数化的概念。
3. 创建最小 Maven + TestNG 项目。
4. 为一个简单业务规则写出正常、异常和边界测试。
5. 在 Notion 记录运行结果、卡点和下一步。
