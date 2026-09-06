# Order API 接口契约

这是第三阶段配套教学服务的固定契约，供测试设计和断言使用。

## 运行与数据

- `OrderApiServer` 使用 JDK HTTP Server，只监听 `127.0.0.1`，端口由系统分配。
- 测试继承 `LocalApiTest`：每条测试启动一个新服务，结束后关闭；`baseUri` 是当次地址。
- 在 IDEA 中运行 `OrderApiServer.main` 也可单独启动服务，控制台会输出地址；停止运行即关闭。
- 初始订单为空，订单 ID 从 `ORD-1` 开始。商品目录固定，列表按照下表顺序返回。
- 金额单位为分。支付表示教学订单的状态变化，服务使用本地内存数据。
- 本阶段只有一个教学账号：`student` / `study123`。成功登录生成新的随机 token，token 随服务实例关闭失效。
- 所有响应格式为 `application/json; charset=utf-8`。

| 商品 ID | 名称 | 类别 | 单价（分） |
| --- | --- | --- | --- |
| PRD-1 | Notebook | STATIONERY | 1200 |
| PRD-2 | Pen | STATIONERY | 300 |
| PRD-3 | Backpack | BAGS | 8800 |

## 接口一览

| 方法与路径 | 认证 | 请求内容 | 成功响应 |
| --- | --- | --- | --- |
| `GET /products` | 公开 | 可选查询参数 `category` | 200，商品列表 |
| `GET /products/{productId}` | 公开 | 路径中的商品 ID | 200，商品 |
| `POST /auth/login` | 公开 | JSON：`username`、`password` | 200，token |
| `POST /orders` | Bearer token | JSON：`productId`、`quantity` | 201，订单，含 `Location` 头 |
| `GET /orders` | Bearer token | 可选查询参数 `status` | 200，订单列表 |
| `GET /orders/{orderId}` | Bearer token | 路径中的订单 ID | 200，订单 |
| `POST /orders/{orderId}/pay` | Bearer token | 无请求体 | 200，支付后的订单 |
| `POST /orders/{orderId}/cancel` | Bearer token | 无请求体 | 200，取消后的订单 |

需要 JSON 请求体的接口必须设置 `Content-Type: application/json`，可以附带 `charset=utf-8`。JSON 必须是符合字段定义的对象；数量使用 JSON 整数，字符串形式的数字与小数均返回 400 `INVALID_JSON`。未定义的 JSON 字段同样返回 400 `INVALID_JSON`。

## 商品查询

`GET /products/PRD-1` 返回 200：

```json
{
  "id": "PRD-1",
  "name": "Notebook",
  "category": "STATIONERY",
  "unitPriceCents": 1200
}
```

`GET /products?category=STATIONERY` 返回 200，列表结构为：

```json
{
  "items": [
    {"id": "PRD-1", "name": "Notebook", "category": "STATIONERY", "unitPriceCents": 1200},
    {"id": "PRD-2", "name": "Pen", "category": "STATIONERY", "unitPriceCents": 300}
  ],
  "total": 2
}
```

不传 `category` 返回全部商品；传入类别按大小写精确匹配，没有匹配项返回 `{"items":[],"total":0}`。

## 登录与认证

`POST /auth/login` 的请求体：

```json
{"username":"student","password":"study123"}
```

成功响应：

```json
{"token":"每次登录实际生成的token","tokenType":"Bearer"}
```

订单接口通过请求头 `Authorization: Bearer <实际token>` 认证。账号或密码错误、为空或缺失时，登录返回 401 `INVALID_CREDENTIALS`。缺失认证头返回 401 `AUTH_REQUIRED`；不符合 Bearer 格式或 token 无效返回 401 `INVALID_TOKEN`。401 响应包含 `WWW-Authenticate: Bearer`。

所有有效 token 对应同一个教学账号，可操作本服务实例内的订单。

## 创建与查询订单

`POST /orders` 的请求体：

```json
{"productId":"PRD-1","quantity":2}
```

- `productId` 必须是非空、非空白的字符串，并对应已存在商品。
- `quantity` 必填，必须是 1 到 10（含）的整数。
- 商品价格由目录确定，订单总价为商品单价乘数量。
- 创建成功后状态为 `PENDING`；返回 201，并通过 `Location` 响应头给出 `/orders/<新订单ID>`。
- 请求失败不会创建订单，也不会消耗订单编号。
- 校验顺序：认证 → JSON 请求格式 → 商品 ID 是否为空 → 数量范围 → 商品是否存在。

创建成功和 `GET /orders/{orderId}` 均返回以下结构：

```json
{
  "id": "ORD-1",
  "product": {"id": "PRD-1", "name": "Notebook", "category": "STATIONERY", "unitPriceCents": 1200},
  "quantity": 2,
  "totalAmountCents": 2400,
  "status": "PENDING"
}
```

`GET /orders` 返回 `{"items":[订单对象],"total":数量}`，按订单创建顺序排列。可使用 `status=PENDING`、`PAID` 或 `CANCELLED` 过滤；无匹配项返回空列表；其他状态值（含空字符串）返回 400 `INVALID_STATUS`。

## 支付与取消

允许的状态变化：`PENDING → PAID`、`PENDING → CANCELLED`。

- 支付或取消成功返回 200 和更新后的订单；订单号、商品、数量、金额保持不变。
- 已支付或已取消订单再次支付、取消均返回 409 `ORDER_STATE_CONFLICT`。
- 失败操作不改变订单状态，使用查询接口再次确认。
- 查询、支付或取消不存在订单，均返回 404 `ORDER_NOT_FOUND`。

## 错误响应

错误响应使用平铺字段 `code` 和 `message`，例如：

```json
{"code":"PRODUCT_NOT_FOUND","message":"Product not found: PRD-404"}
```

| HTTP 状态 | code | message |
| --- | --- | --- |
| 400 | INVALID_PRODUCT_ID | productId must not be blank |
| 400 | INVALID_QUANTITY | quantity must be between 1 and 10 |
| 400 | INVALID_STATUS | status must be PENDING, PAID or CANCELLED |
| 400 | INVALID_JSON | Request body must match the JSON contract（JSON null：Request body must be a JSON object） |
| 401 | INVALID_CREDENTIALS | Invalid username or password |
| 401 | AUTH_REQUIRED | Bearer token is required |
| 401 | INVALID_TOKEN | Invalid bearer token |
| 404 | PRODUCT_NOT_FOUND | Product not found: `<请求商品ID>` |
| 404 | ORDER_NOT_FOUND | Order not found: `<请求订单ID>` |
| 404 | ROUTE_NOT_FOUND | Route not found |
| 405 | METHOD_NOT_ALLOWED | Method not allowed（同时返回 Allow 响应头） |
| 409 | ORDER_STATE_CONFLICT | Only PENDING orders can be paid or cancelled |
| 415 | UNSUPPORTED_MEDIA_TYPE | Content-Type must be application/json |

第一章只需要使用商品详情接口的 200 和 404，其余接口随对应章节学习。
