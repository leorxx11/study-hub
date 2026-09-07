# REST Assured 接口自动化

第三阶段：使用 Java 21、TestNG、REST Assured 和 Maven，通过真实 HTTP 测试订单业务。

当前已提供配套服务、服务验收测试及第一至六章代码示例。第七至九章按学习进度逐章补充。

## 从这里开始

1. 在 IntelliJ IDEA 中导入本目录的 `pom.xml`，使用 JDK 21 或更高版本。
2. 按 `src/test/java/com/studyhub/api/reference/chapterXX` 的章节顺序阅读并运行示例。
3. 第一章已完成的练习保留在 `src/test/java/com/studyhub/api/exercise/chapter01`。

测试会自动启动本地服务并关闭，地址由 `baseUri` 提供。每条测试获得独立的内存订单和 token；测试通过 `127.0.0.1` 的动态端口访问服务。

## 文件用途

| 位置 | 用途 | 你现在需要做什么 |
| --- | --- | --- |
| `src/test/java/com/studyhub/api/reference/chapterXX` | 完整阅读示例 | 阅读、运行、理解 |
| `src/test/java/com/studyhub/api/exercise/chapter01` | 第一章练习 | 保留已完成代码 |
| `src/test/java/com/studyhub/api/verification` | 配套服务自身的验收测试 | 由课程维护者维护 |
| `src/test/java/com/studyhub/api/support` | 测试服务的启动与关闭 | 已提供 |
| `src/main/java` | 被测试的 HTTP 服务和订单业务 | 已提供 |

## 九章路线

每章示例只使用当前章及之前学过的内容。

| 章节 | 重点 | 示例内容 |
| --- | --- | --- |
| 1. HTTP 与第一个接口测试 | HTTP、`given/when/then`、状态码、响应格式、简单字段断言 | 商品查询成功与不存在 |
| 2. 构造请求 | 路径参数、查询参数、请求头、JSON 请求体 | 商品查询、筛选及登录请求 |
| 3. 响应断言与数据提取 | 嵌套字段、数组、Hamcrest、JsonPath、extract | 验证列表并提取响应字段 |
| 4. 登录与认证 | 获取 token、Bearer 认证、401 | 正确、缺失及无效 token |
| 5. 接口关联与业务流程 | 使用上一步响应构造下一步请求 | 创建、查询、支付、再查询及取消流程 |
| 6. 数据驱动与失败路径 | DataProvider、边界、400/404/409、失败后的状态 | 非法数量、不存在资源及非法状态变更 |
| 7. Java 对象与 JSON | 序列化与反序列化 | 用 Java 对象发送和读取业务数据 |
| 8. 公共配置与失败定位 | RequestSpecification、ResponseSpecification、日志、数据隔离 | 复用配置并定位失败 |
| 9. 综合验收 | 按契约独立设计测试 | 成功流程、失败流程及整套运行 |

第三阶段使用内存数据，MySQL/Linux 按总路线安排在第四阶段。

## 运行与验收

在本模块目录运行：

```shell
# 验证配套服务和所有已提供的阅读示例
mvn test

# 单独运行某一章示例，替换为对应类名即可
mvn -Dtest=FailurePathsAndDataDrivenExampleTest test

# 连同第一章已完成练习一起运行
mvn '-Dtest=*Test,*Exercise' test
```

Maven Surefire 默认选择 `*Test` 测试类，因此 `mvn test` 会运行服务验收测试和所有章节示例。IDEA 中也可直接运行指定的示例类。

本阶段最终要求：动态传递 token 和订单 ID；覆盖成功、非法输入、认证失败、资源不存在、状态冲突；从 HTTP 再次查询确认业务状态；每条测试独立准备数据，关联流程写在同一个测试方法中。

## 官方资料

- [REST Assured 入门与 Maven 依赖](https://github.com/rest-assured/rest-assured/wiki/GettingStarted)
- [REST Assured 使用指南](https://github.com/rest-assured/rest-assured/wiki/Usage)
- [JDK HttpServer](https://docs.oracle.com/en/java/javase/21/docs/api/jdk.httpserver/com/sun/net/httpserver/HttpServer.html)
