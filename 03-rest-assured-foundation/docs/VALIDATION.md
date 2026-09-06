# 配套服务与第一章验证记录

验证日期：2026-09-07。

## 范围与环境

- 范围：订单 HTTP 服务、接口契约、测试生命周期、第一章阅读示例与待填写练习入口。
- 编译目标：Java 21（`maven.compiler.release=21`）。
- 实际运行：OpenJDK 25.0.2、IntelliJ IDEA 自带 Maven 3.9.16。
- REST Assured 6.0.1、TestNG 7.9.0、Jackson 2.21.6。
- 使用真实 `127.0.0.1` HTTP 请求，端口由系统分配，订单和 token 保存在各服务实例的内存中。
- 此次在 Java 25 上运行 Java 21 目标字节码；未另行验证 Java 21 运行时。

## 整模块运行

在模块目录执行 `mvn -B -ntp test`。本机使用 IDEA 内置 Maven 的实际命令为：

```shell
"/Applications/IntelliJ IDEA.app/Contents/plugins/maven-plugin/lib/maven3/bin/mvn" -B -ntp test
```

最终结果：**41 条测试，失败 0，错误 0，跳过 0，BUILD SUCCESS**。

| 测试类 | 用例数（含数据驱动） | 结果 |
| --- | --- | --- |
| `OrderApiContractTest` | 39 | 全部通过 |
| `ServerLifecycleTest` | 1 | 通过 |
| `FirstApiExampleTest` | 1 | 通过 |

完整调用链覆盖：

1. TestNG 启动本地服务，REST Assured 发送 HTTP 请求。
2. 查询商品及类别筛选，验证响应格式、顺序、字段与价格。
3. 登录得到 token；订单的五种请求入口均拒绝缺失或无效认证。
4. 创建订单，查询核对嵌套商品、数量、总价和初始状态。
5. 支付或取消订单，再次查询确认状态保存。
6. 验证非法状态变更被拒绝，拒绝后状态和金额保持不变。
7. 验证数量边界、缺失字段、非法 JSON/类型、不存在资源及协议错误。
8. 验证失败下单不产生订单、不消耗编号；订单筛选反映当前状态。
9. 验证不同服务实例不共享订单和 token。
10. 关闭服务；额外使用 JDK HTTP Client 确认关闭后连接被拒绝。

原始报告由 Maven 生成在 `target/surefire-reports/TEST-TestSuite.xml` 和 `testng-results.xml`，属于本地构建产物，后续运行会更新。

## 练习入口检查

显式运行 `FirstApiExercise`，确认两个方法都被 TestNG 发现并执行。结果为两条 `AssertionError: TODO...`，错误 0、跳过 0；这两处保留给学员填写，因此本次练习入口检查预期返回失败退出码。

练习运行报告同时确认 `startLocalApi` 和 `stopLocalApi` 各成功执行两次，练习断言失败后服务仍正常关闭。

默认 `mvn test` 的 41 条通过结果不包含未完成练习。完成第一章后需执行：

```shell
mvn -Dtest=FirstApiExercise test
mvn '-Dtest=*Test,*Exercise' test
```

## 运行提示

TestNG 依赖的 SLF4J 在本机输出“未加载日志实现”的提示，实际 HTTP 测试与断言已正常执行；该提示未导致失败或跳过。
