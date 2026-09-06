# 第一章：HTTP 与第一个接口测试

## 本章目标

你已经能用 TestNG 运行测试、写断言。这一章把被测试对象换成 HTTP 接口：发送请求，检查服务返回的响应。

完成后，你应能写出商品查询成功和商品不存在两条接口测试，并解释每个断言在检查什么。

## 先认识一次请求与响应

假设这次测试服务地址是 `http://127.0.0.1:54321`，我们查询 Notebook：

```http
GET /products/PRD-1 HTTP/1.1
Host: 127.0.0.1:54321
```

| 部分 | 本次含义 |
| --- | --- |
| `http` | 使用 HTTP 协议 |
| `127.0.0.1` | 运行测试的本机 |
| `54321` | 示例端口，实际由系统分配 |
| `GET` | 请求读取资源 |
| `/products/PRD-1` | 要读取的商品路径 |

服务处理后返回：

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":"PRD-1","name":"Notebook","category":"STATIONERY","unitPriceCents":1200}
```

响应有三个重点：

1. **状态码**：`200` 表示这次查询成功；本服务查询不存在商品时返回 `404`。
2. **响应头**：`Content-Type` 说明响应体格式，这里是 JSON。
3. **响应体**：具体商品数据；`1200` 的单位是分，即 12 元。

`200` 只能证明接口报告成功；商品名或价格仍可能错误，所以需要同时断言响应字段。

## 运行阅读示例

打开 [FirstApiExampleTest.java](../../src/test/java/com/studyhub/api/reference/chapter01/FirstApiExampleTest.java)，在 IDEA 中运行 `shouldGetNotebook`。

核心代码如下：

```java
given()
        .baseUri(baseUri)
.when()
        .get("/products/PRD-1")
.then()
        .statusCode(200)
        .contentType(ContentType.JSON)
        .body("id", equalTo("PRD-1"))
        .body("name", equalTo("Notebook"))
        .body("unitPriceCents", equalTo(1200));
```

| 代码 | 含义 |
| --- | --- |
| `given()` | 开始设置本次请求 |
| `.baseUri(baseUri)` | 使用本次测试服务地址，传入的是父类准备好的字符串 |
| `.when()` | 进入发送请求部分 |
| `.get("/products/PRD-1")` | 发送 GET 请求，获得服务响应 |
| `.then()` | 进入响应验证部分 |
| `.statusCode(200)` | 断言 HTTP 状态码等于 200 |
| `.contentType(ContentType.JSON)` | 断言响应体是 JSON 格式，允许带 charset 参数 |
| `.body("name", equalTo("Notebook"))` | 读取响应 JSON 的 name 字段，断言它等于 Notebook |

这里 `.then().body(...)` 是**响应断言**。下一章用于设置请求体的 `.given().body(...)` 处于不同位置，作用也不同。

`equalTo(...)` 来自 Hamcrest，返回一个“相等”匹配器。它会被 REST Assured 用来验证实际值；验证不符合预期时抛出断言错误，TestNG 将这条测试标记为失败。

`given()` 与 `equalTo()` 通过文件顶部的静态导入使用：

```java
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
```

`unitPriceCents` 在 JSON 中是整数，所以预期值写 `1200`，不要写成字符串 `"1200"`。

## 测试中的服务从哪里来

示例和练习都继承 [LocalApiTest](../../src/test/java/com/studyhub/api/support/LocalApiTest.java)。它使用你已学过的 TestNG 生命周期：

`@BeforeMethod 启动服务 → 执行你的 HTTP 测试 → @AfterMethod 关闭服务`

每条测试都使用自己的服务与数据；`baseUri` 已准备好，本章直接使用即可。你不需要手工填写端口或提前启动其他项目。

## 现在写练习

打开 [FirstApiExercise.java](../../src/test/java/com/studyhub/api/exercise/chapter01/FirstApiExercise.java)。这是需要你填写的文件，两个测试目前都会通过 `Assert.fail("TODO...")` 提醒你尚未完成。

| 练习 | 请求 | 要检查的响应 |
| --- | --- | --- |
| 查询 Pen | `GET /products/PRD-2` | 200、JSON；id=PRD-2、name=Pen、category=STATIONERY、unitPriceCents=300 |
| 查询不存在商品 | `GET /products/PRD-404` | 404、JSON；code=PRODUCT_NOT_FOUND、message=Product not found: PRD-404 |

只使用示例里的方法即可。每完成一条，删除那条方法内的 `Assert.fail("TODO...")`，然后运行测试。

这里“接口返回 404”和“测试失败”是两回事：你预期不存在商品返回 404，而服务确实返回 404，这条测试就应该通过。

## 第一章验收

在 IDEA 中单独运行 `FirstApiExercise`，或者在模块目录执行：

```shell
mvn -Dtest=FirstApiExercise test
```

两条练习通过后，再运行模块内的联合验收：

```shell
mvn '-Dtest=*Test,*Exercise' test
```

你需要能够说明：请求发到了哪里；GET 的作用；为什么断言状态码、响应类型和业务字段；为什么预期的 404 也算测试通过。

参考：[REST Assured 官方用法](https://github.com/rest-assured/rest-assured/wiki/Usage)。
