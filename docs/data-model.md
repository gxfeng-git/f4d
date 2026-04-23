# 数据模型

## 全局状态

### `DataSourceMeta`

- `id`
- `name`
- `createdAt`
- `updatedAt`
- `lastOpenedAt`
- `originType`
- `originLabel?`
- `schemaVersion`

### `AppState`

- `activeSourceId`
- `theme`
- `uiPreferences`
- `dismissedUpdateVersion?`

## 业务实体

- `Account`
- `Transaction`
- `DebtRecord`
- `DebtRepayment`
- `LoanPlatform`
- `LoanRecord`
- `LoanInstallment`

所有业务实体都带 `sourceId`，用于本地隔离。

## 余额规则

- 账户表不存余额。
- 余额由 `Transaction.amountDelta` 统一回算。
- “编辑余额”通过写入系统 `balance_adjustment` 流水实现。

## 导入导出

### `AppSnapshot`

- `schemaVersion`
- `exportedAt`
- `accounts`
- `transactions`
- `debtRecords`
- `debtRepayments`
- `loanPlatforms`
- `loanRecords`
- `loanInstallments`

导出只包含单个数据源的完整快照，不包含注册表和全局设置。

## 覆盖已有数据源

- 允许覆盖任意已有数据源，不限于当前激活源。
- 覆盖时保留目标数据源的 `id`、`name`、`createdAt`。
- 会重写该 `sourceId` 下全部业务数据，并刷新 `updatedAt`、`originType`、`originLabel`、`schemaVersion`。
