# 功能五：准备提交 PR

## 0. 人工交付物由参与者定稿（Agent 生成草稿仅供参考）

以下功能涉及的**人工交付物最终须由参与者本人理解并定稿**，但 Agent 可以先生成一版**草稿**供参考，由参与者在此基础上修改确认：

**整合进 Pull Request（公开）：**

- Pull Request 标题和说明；
- 关键页面截图；
- 主要交互说明；
- 需要审核者重点确认的问题；

**按 `docs/SUBMISSION.md` 通过指定私有渠道提交（不写入公开 GitHub）：**

- 一页以内的修改说明草稿；
- 5–8 分钟现场展示提纲。

**Agent 在本功能执行时应先询问参与者并生成草稿**，建议做法：

- 在仓库外部新建**目录 `PR_MATERIALS/`**，为每个交付物创建一个草稿文件（Agent 先填好**初稿**）。建议文件名：
  - `PR_MATERIALS/01-pr-title-and-description.md` — PR 标题和说明
  - `PR_MATERIALS/02-screenshots` — 关键页面截图（可在此文件夹存放截图）
  - `PR_MATERIALS/03-interactions.md` — 主要交互说明
  - `PR_MATERIALS/04-review-questions.md` — 需审核者重点确认的问题
  - `PR_MATERIALS/05-modification-notes.md` — 修改说明草稿
  - `PR_MATERIALS/06-presentation-outline.md` — 5–8 分钟现场展示提纲
- 明确告知参与者该目录路径与用途，并提示「这是 Agent 生成的草稿，请逐项检查、人工修改后作为最终交付物」；
- 参与者修改定稿后，Agent 应将**前 4 个文件**（01–04）整合进 Pull Request 的**说明（description）**中创建 PR；**后 2 个文件**（05–06）按 `docs/SUBMISSION.md` 通过指定私有渠道提交，**不写入公开 GitHub**。

> `PR_MATERIALS/` 属于参与者侧材料，**不纳入本次 PR**

## 1. 技术步骤（Agent 自动执行）

- 推送分支和创建 Pull Request 前，必须向参与者展示最终改动范围、验证结果和待提交内容，并获得确认；
- 确认后可以协助推送**个人分支**和创建 Pull Request，**不得直接推送 `main`**。

## 2. 检查失败处理

Pull Request 检查失败时必须先读日志：如果失败发生在仓库校验、构建或范围检查步骤，修复项目后再推送；如果发生在获取运行器、下载官方 Action 或访问 GitHub 服务阶段，先查看 GitHub Status，待服务恢复后使用 `Re-run jobs`，不得把平台故障误判为作品错误。

## 3. 外部材料提交

论文 PDF 或链接、修改说明和教师要求的其他材料按 `docs/SUBMISSION.md` 通过指定私有渠道提交。入口未公布时，将其列为待办，不得上传到公开 GitHub。
