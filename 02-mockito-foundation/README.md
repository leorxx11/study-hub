# Mockito Foundation

第二阶段继续使用 TestNG 运行测试，学习重点从“组织测试”切换到“隔离依赖”。

## 阶段边界

- 只测试普通 Java 对象，不引入 Spring、数据库或 HTTP。
- 真实对象是 `PaymentService`。
- `OrderRepository`、`PaymentGateway`、`NotificationService` 是外部依赖，测试时使用 Mock。
- 不用重试掩盖稳定失败，不 Mock 简单值对象。

## 学习顺序

1. `mock`、`when`、`thenReturn`、`verify`
2. 参数匹配器与调用次数
3. 异常、`void` 方法和 `doThrow`
4. `@Mock`、`@InjectMocks` 与 TestNG 生命周期
5. `ArgumentCaptor` 与 `InOrder`
6. `spy`、严格桩和常见误区
7. 综合练习与 `mvn test`

## 完成标准

- 成功、订单不存在、状态错误和网关拒绝场景均有测试。
- 能区分状态断言与交互验证。
- 能确认失败路径没有保存订单、没有发送通知。
- 所有测试不访问真实数据库、支付网关或消息服务。
- `mvn test` 稳定通过。

## 业务流程

```text
PaymentService
├── OrderRepository      查询与保存订单
├── PaymentGateway       发起扣款
└── NotificationService  发送支付成功通知
```
