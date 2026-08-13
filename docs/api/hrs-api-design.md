# HRS API 设计说明

> 状态：`Draft for leader review`  
> 版本：`v1`  
> 基础路径：`/api/hrs/v1`  
> 机器契约：[hrs-v1.yaml](./openapi/hrs-v1.yaml)

## 1. 目的与边界

本文档将 HRS 的考勤、薪酬、年末调整、人事与权限需求转换为可实施的 HTTP API 契约。OpenAPI 文件是前端、后端、Mock 与测试的唯一字段来源；本文档解释契约背后的状态、权限和跨模块规则。

HRS 负责：

- 职员业务档案及 HRS 业务资格。
- 考勤事件、请假、修正申请、月度统计和结算。
- 薪酬配置、计算编排、职员确认、调整、封账和转账文件。
- 年末调整申告、审核、计算编排、精算和法定文书。
- HRS 权限上下文与管理接口。接入 COMMON 后，这组路径不变，由服务端适配 COMMON。

HRS 不负责：

- 密码、登录和 JWT 的签发。
- 邮件、站内通知的最终投递。
- 对象存储的永久公开地址。
- 浏览器端计算正式工资、税费或法定文书。

## 2. 版本与实施阶段

|阶段|模块|目标|
|---|---|---|
|0|公共契约|会话上下文、字典、任务、文件、错误结构|
|1|人事与权限|职员档案、银行资料、状态、角色模板与个人覆盖|
|2|考勤|逐次打卡、请假、修正、统计、调整与结算|
|3|薪酬|配置、计算、确认、调整、封账、PDF、全银协文件|
|4|年末调整|申告、附件、审核、计算、精算与法定文书|

契约采用 URL 主版本 `/v1`。兼容性新增字段不升级主版本；删除、改名或语义变更必须新建 `/v2`。

## 3. 通用约定

### 3.1 数据格式

- JSON 字段使用 `camelCase`。
- 日期使用 `YYYY-MM-DD`。
- 时间戳使用包含时区的 ISO 8601，例如 `2026-08-13T09:00:00+09:00`。
- 业务时区固定为 `Asia/Tokyo`。
- 正式金额使用十进制字符串，例如 `"320000.00"`；不得使用浮点数。
- ID 是不透明字符串，客户端不得推导其格式或顺序。
- 可修改资源包含递增 `version`。更新请求必须携带当前版本。

### 3.2 认证与请求头

生产请求：

```http
Authorization: Bearer <JWT>
Accept-Language: ja-JP
X-Request-Id: req_client_generated_optional
```

高风险或可重复触发操作还需：

```http
Idempotency-Key: <uuid>
```

开发 Mock 可以跳过 JWT，但必须返回与生产相同的 `SessionContext`。

### 3.3 成功响应

```json
{
  "success": true,
  "code": "HRS_OK",
  "message": "",
  "data": {},
  "requestId": "req_01"
}
```

分页数据：

```json
{
  "success": true,
  "code": "HRS_OK",
  "message": "",
  "data": {
    "items": [],
    "page": 1,
    "pageSize": 20,
    "total": 125
  },
  "requestId": "req_01"
}
```

`pageSize` 默认 20，最大 100。排序使用 `sort=field:asc,otherField:desc`。

### 3.4 错误响应

```json
{
  "success": false,
  "code": "HRS_SALARY_ALREADY_FINALIZED",
  "message": "給与はすでに確定されています",
  "data": null,
  "errors": [{ "field": "status", "reason": "invalidState" }],
  "requestId": "req_01"
}
```

|HTTP|用途|
|---|---|
|400|JSON、参数结构或请求头不合法|
|401|未登录或 Token 失效|
|403|功能权限或数据范围不足|
|404|资源不存在或无权得知其存在|
|409|版本、状态、重复操作或唯一约束冲突|
|422|字段或跨字段业务校验失败|
|429|超过频率限制|
|500|未预期内部错误|
|503|COMMON、存储或计算服务不可用|

### 3.5 并发、幂等与异步任务

- PATCH/PUT/状态变更请求体带 `version`；旧版本返回 `409 HRS_VERSION_CONFLICT`。
- 打卡事件、审批、计算、封账、导出和精算必须支持 `Idempotency-Key`。
- 计算与批量文件生成返回 `202`：`{ jobId, status, progress }`。
- 客户端通过 `GET /jobs/{jobId}` 轮询；建议间隔 1 秒并指数退避，终态后停止。
- 异步终态：`SUCCEEDED`、`FAILED`、`CANCELLED`。

## 4. 权限与数据范围

最终权限为：

```text
effectivePermissions = rolePermissions + grantedPermissions - revokedPermissions
```

数据范围：

- `SELF`：仅关联职员本人。
- `DEPARTMENT`：当前所属部门。
- `DEPARTMENT_TREE`：所属部门及其下级部门。
- `SELECTED_DEPARTMENTS`：显式指定部门集合。
- `ALL`：全部数据。

前端只使用 `effectivePermissions` 控制菜单与按钮。API 每次请求都必须鉴权与计算数据范围；不能依赖前端传入 employeeId 来限制本人数据。

高敏权限必须独立：银行账户查看、薪资管理、My Number 税务文书、权限变更和受保护文件下载。

## 5. 需求追踪矩阵

|界面/流程|API 分组|主要权限|主要模型|阶段|
|---|---|---|---|---|
|应用壳与当前账户|Context|登录用户|SessionContext|0|
|人事资料管理|Personnel|HRS:PERSONNEL:DATA|Employee、EmploymentProfile|1|
|银行账户|Personnel|HRS:PERSONNEL:BANK|EmployeeBankAccount|1|
|权限配置|Access|HRS:ACCESS:ADMIN|RoleTemplate、AccountAccess|1|
|个人考勤首页与打卡|Attendance|HRS:ATTENDANCE:PUNCH|AttendanceEvent、DailyAttendanceSummary|2|
|记录与修正|Attendance|SELF_MODIFY / MODIFY_APPROVE|AttendanceModificationRequest|2|
|请假|Leave|APPLY / APPROVE|LeaveApplication|2|
|考勤管理与结算|Attendance Admin|ADMIN / CALC|MonthlyAttendanceSummary|2|
|个人薪资明细|Salary Self|HRS:SALARY:SELF_VIEW|SalaryDetail|3|
|薪资配置与项目|Salary Config|CONFIG / ITEM / TYPE|SalaryItemDefinition|3|
|薪资计算与封账|Salary Admin|CALC / ADMIN|SalaryPeriod、SalaryCalculationBatch|3|
|台账与转账|Salary Export|LEDGER_EXPORT|LedgerExport、BankTransferResult|3|
|年末调整申告|Nencho Self|SELF_DECLARE|NenchoDeclaration|4|
|申告审核|Nencho Review|REVIEW|NenchoDeclaration|4|
|计算与精算|Nencho Calculation|CALC / ADJUST|NenchoResult|4|
|源泉徴収票与法定调书|Nencho Documents|TAX_SLIP / STAT_REPORT|ProtectedFile|4|
|人事评价|Capability|PERSONNEL:EVAL|FeatureCapability|后续|

## 6. 接口目录

完整请求和响应参见 OpenAPI。下表用于评审接口边界。

### 6.1 公共上下文、字典、任务与文件

|方法|路径|说明|
|---|---|---|
|GET|`/context`|当前账户、职员、权限和数据范围|
|GET|`/dictionaries`|HRS 枚举字典|
|GET|`/references/departments`|部门引用数据|
|GET|`/references/positions`|职位引用数据|
|GET|`/capabilities`|模块能力及启用状态|
|GET|`/jobs/{jobId}`|异步任务状态|
|POST|`/files/{fileId}/download-ticket`|创建短期下载票据|

### 6.2 人事

|方法|路径|说明|
|---|---|---|
|GET / POST|`/employees`|查询、新增职员|
|GET / PATCH|`/employees/{employeeId}`|职员详情、基础资料更新|
|POST|`/employees/{employeeId}/status-transitions`|变更在职状态|
|GET / PUT|`/employees/{employeeId}/salary-profile`|薪资基础资料|
|GET / PUT|`/employees/{employeeId}/bank-account`|银行账户；GET 默认脱敏|
|GET|`/employees/{employeeId}/audit-entries`|人事资料变更历史|

### 6.3 权限

|方法|路径|说明|
|---|---|---|
|GET|`/access/accounts`|账户列表|
|GET|`/access/permissions`|权限目录|
|GET / POST|`/access/roles`|角色模板列表、新增|
|GET / PATCH|`/access/roles/{roleId}`|角色模板详情、更新|
|GET / PUT|`/access/accounts/{accountId}`|账户角色和个人覆盖|
|GET|`/access/accounts/{accountId}/effective-permissions`|最终权限预览|
|GET|`/access/audit-entries`|权限变更审计|

### 6.4 考勤与请假

|方法|路径|说明|
|---|---|---|
|GET|`/attendance/today`|本人今日状态、事件和汇总|
|POST|`/attendance/events`|上班、休息、下班逐次事件|
|GET|`/attendance/records`|本人每日记录|
|GET|`/attendance/records/{recordId}`|记录详情与时间线|
|GET / POST|`/attendance/modification-requests`|本人修正申请|
|GET|`/attendance/modification-requests/{requestId}`|修正申请详情|
|POST|`/attendance/modification-requests/{requestId}/decisions`|管理员审批|
|GET / POST|`/leave-applications`|本人请假查询、新增|
|POST|`/leave-applications/{applicationId}/cancel`|本人撤销|
|POST|`/leave-applications/{applicationId}/decisions`|管理员审批|
|GET / PUT|`/attendance/config`|考勤配置|
|GET / POST|`/attendance/types`|考勤类型|
|PATCH / DELETE|`/attendance/types/{typeId}`|更新、删除考勤类型|
|GET|`/attendance/monthly-summaries`|管理员月度汇总|
|POST|`/attendance/periods/{periodId}/actions/calculate`|计算月度统计|
|POST|`/attendance/monthly-summaries/{summaryId}/adjustments`|手动调整|
|POST|`/attendance/periods/{periodId}/actions/settle`|月度结算|
|GET|`/attendance/adjustment-logs`|调整日志|

### 6.5 薪酬

|方法|路径|说明|
|---|---|---|
|GET / PUT|`/salary/config`|薪资日期配置|
|GET / POST|`/salary/types`|薪资类型|
|PATCH / DELETE|`/salary/types/{typeId}`|更新、停用薪资类型|
|GET / POST|`/salary/items`|固定/自定义薪资项目|
|PATCH / DELETE|`/salary/items/{itemId}`|更新、停用自定义项目|
|GET / POST|`/salary/templates`|薪资明细模板|
|GET / PATCH|`/salary/templates/{templateId}`|模板详情、更新|
|POST|`/salary/templates/{templateId}/actions/preview`|异步预览 PDF|
|GET|`/salary/periods`|月度薪资期间|
|GET|`/salary/periods/{periodId}`|进度、摘要、异常数量|
|POST|`/salary/periods/{periodId}/actions/calculate`|触发计算|
|GET|`/salary/periods/{periodId}/issues`|计算异常|
|GET|`/salary/details`|管理员职员薪资列表|
|GET|`/salary/details/{detailId}`|薪资明细|
|POST|`/salary/details/{detailId}/adjustments`|调整自定义项目|
|GET|`/salary/self/details`|本人薪资月份列表|
|GET|`/salary/self/details/{detailId}`|本人薪资明细|
|POST|`/salary/self/details/{detailId}/actions/confirm`|本人确认|
|POST|`/salary/periods/{periodId}/actions/finalize`|封账|
|POST|`/salary/details/{detailId}/actions/generate-payslip`|正式 PDF|
|POST|`/salary/periods/{periodId}/ledger-exports`|生成全银协文件|
|GET|`/salary/ledger-exports/{exportId}`|导出状态|
|POST|`/salary/ledger-exports/{exportId}/transfer-results`|登记银行结果|
|GET|`/salary/audit-entries`|调整、封账、导出审计|

### 6.6 年末调整

|方法|路径|说明|
|---|---|---|
|GET / POST|`/nencho/periods`|期间列表、新建|
|GET / PATCH|`/nencho/periods/{periodId}`|期间详情、更新|
|POST|`/nencho/periods/{periodId}/actions/activate`|启用期间|
|GET|`/nencho/periods/{periodId}/targets`|对象职员|
|POST|`/nencho/periods/{periodId}/targets`|手动追加|
|DELETE|`/nencho/periods/{periodId}/targets/{employeeId}`|排除对象|
|GET|`/nencho/self/declarations`|本人申告书列表|
|GET / PUT|`/nencho/self/declarations/{declarationId}`|详情、保存草稿|
|POST|`/nencho/self/declarations/{declarationId}/certificates`|上传证明文件|
|DELETE|`/nencho/self/declarations/{declarationId}/certificates/{certificateId}`|删除文件|
|POST|`/nencho/self/declarations/{declarationId}/actions/submit`|提交申告|
|GET|`/nencho/review/declarations`|管理员进度列表|
|GET|`/nencho/review/declarations/{declarationId}`|审核详情|
|POST|`/nencho/review/declarations/{declarationId}/decisions`|确认或差戻し|
|POST|`/nencho/periods/{periodId}/actions/migrate-previous-data`|前年数据引继|
|GET / POST|`/nencho/tax-parameters`|税法参数版本|
|POST|`/nencho/periods/{periodId}/actions/calculate`|触发计算|
|GET|`/nencho/periods/{periodId}/results`|過不足税额|
|POST|`/nencho/periods/{periodId}/actions/settle`|精算反映|
|POST|`/nencho/periods/{periodId}/withholding-tax-slip-batches`|批量源泉徴収票|
|POST|`/nencho/periods/{periodId}/statutory-report-batches`|法定调书|

## 7. 状态机

### 7.1 当日考勤

```text
NOT_STARTED --CLOCK_IN--> WORKING --BREAK_START--> ON_BREAK
ON_BREAK --BREAK_END--> WORKING --CLOCK_OUT--> COMPLETED
WORKING --CLOCK_OUT--> COMPLETED
```

非法事件返回 `409 HRS_ATTENDANCE_INVALID_EVENT_TRANSITION`。补录不伪造实时事件，必须走修正申请并保留审计。

### 7.2 修正和请假

```text
DRAFT/PENDING --> APPROVED
              --> REJECTED
PENDING leave --> CANCELLED
```

REJECTED 是单次申请终态。重新申请必须创建新资源，解决原文档“终态但允许重新提交”的冲突。

### 7.3 月度考勤

```text
OPEN --> CALCULATING --> CALCULATED --> SETTLED
             |                |
             +----FAILED------+
```

SETTLED 后普通更新禁止；修正获批后由具备权限的管理员发起重新计算，并产生新版本和审计记录。

### 7.4 薪资

```text
PENDING --> CALCULATING --> CALCULATED --> FINALIZED
               |                 |
               +----FAILED-------+
```

职员确认是独立字段：`UNCONFIRMED`、`CONFIRMED_BY_EMPLOYEE`、`AUTO_CONFIRMED`，不复用薪资期间状态。

### 7.5 年末调整申告与结果

```text
DRAFT --> SUBMITTED --> CONFIRMED
             |
             +--> RETURNED --> SUBMITTED

PENDING --> CALCULATING --> CALCULATED --> SETTLED
```

采用 `RETURNED` 取代易误解的“REJECTED 终态”；同一申告可修正后重新提交，保留每次提交版本。

## 8. 文件与敏感数据

- 上传采用 `multipart/form-data`，服务端验证扩展名、MIME、大小和恶意内容。
- API 返回 `fileId` 与元数据，不返回对象存储永久地址。
- 下载前通过 `download-ticket` 校验权限并生成短期、单用途票据。
- 银行账户列表只返回 `maskedAccountNumber`；完整号码仅在专用权限和审计下返回。
- My Number 不属于普通前端模型。従業員用源泉徴収票禁止包含 My Number。
- 税務署用含 My Number 文书只允许受限后台任务生成，不提供浏览器字段级预览。
- 薪资、银行、证明文件、权限和法定文书访问全部记录审计。

## 9. 前端契约使用方式

- 从 OpenAPI 生成 DTO 类型到独立目录，禁止手工修改生成文件。
- 页面只使用领域模型；API adapter 负责 DTO 到领域模型转换。
- Mock 响应复用相同 DTO 类型和示例，禁止页面自行发明字段。
- 正式工资、税费、年末调整和全银协数据不在浏览器计算。
- 401 跳转登录；403 展示无权限；409 提示刷新；422 将字段错误映射到表单。

## 10. Leader/后端评审清单

1. COMMON 是否提供 JWT、账户、部门、职位和通知；HRS 适配责任由哪一服务承担。
2. ID、分页、错误码和异步任务规范是否符合全局标准。
3. 逐次打卡事件和补录/修正模型是否可接受。
4. 月度考勤重新结算的审批条件。
5. 薪资计算引擎、税法参数和舍入责任。
6. 全银协文件具体版本、字符编码、银行返回结果格式。
7. 对象存储、病毒扫描、OCR 和 PDF 服务责任。
8. My Number 的加密、隔离和审计策略。
9. 年末调整 RETURNED 状态与版本留存策略。
10. 各阶段后端实施顺序及测试环境交付时间。

## 11. 已解决的原需求冲突

- 打卡改为标准时间戳事件，支持工作中/休息中，不再要求首次提交完整时段。
- 新增每日/月度考勤汇总及调整日志模型。
- 职员薪资确认与月度薪资状态分离。
- 新增薪资调整、封账、台账和银行结果模型。
- 权限采用角色模板加个人追加/回收。
- REJECTED 仅表示单次不可恢复申请；可修改再提交的年末申告使用 RETURNED。
- 正式金额与法定文件均由服务端生成。
