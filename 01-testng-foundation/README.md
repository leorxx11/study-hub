# TestNG 测试基础

这是第一阶段的可运行 Maven 模块。业务代码已经提供；测试由你自己设计和编写。

## 目录说明

- `src/main/java`：被测试的业务代码。
- `src/test/java`：你编写的 TestNG 测试代码。
- `src/test/resources`：测试资源；后续将把 `testng.xml` 放在这里。
- `docs`：本阶段需要保留在仓库中的测试设计或运行证据。

## 开始方式

1. 在 IntelliJ IDEA 中打开或导入本目录的 `pom.xml`。
2. 等待 Maven 下载 TestNG 依赖。
3. 阅读 `src/main/java/com/studyhub/order` 下的业务代码与本节规则。
4. 在 `src/test/java/com/studyhub/order` 编写对应的测试。
5. 在本目录运行 `mvn test`。

## 业务规则

`OrderService` 是内存版订单服务；每次新建一个 `OrderService` 都是一个空的订单集合。

- 订单创建后状态为 `PENDING`，订单号按 `ORD-1`、`ORD-2` 依次生成。
- 商品名不能为空或空白；保存时会去掉首尾空白。
- 单次购买数量必须在 `1` 到 `10`（含）之间。
- 单价单位为“分”，必须大于 `0`；订单总价等于数量乘以单价。
- 可用库存不能为负；库存小于购买数量时，订单不能创建。
- `pay`：`PENDING` 到 `PAID`。
- `ship`：`PAID` 到 `SHIPPED`。
- `complete`：`SHIPPED` 到 `COMPLETED`。
- `cancel`：只有 `PENDING` 订单可以变为 `CANCELLED`。
- 查询或操作一个不存在、`null` 或空白的订单号会失败。
- 不符合输入或状态规则时，服务会抛出 `IllegalArgumentException` 或 `IllegalStateException`。

这里故意不提供测试代码、测试分组或 `testng.xml`。你自行选择如何把这些业务规则转化为测试，并逐步加入 TestNG 的生命周期、数据驱动、groups 和 XML 配置。
