# 功能五：准备提交 PR

## 0. 提交内容由参与者确认

以下内容最终须由参与者本人理解并确认，Agent 可以先生成草稿供参考：

**整合进 Pull Request（公开）：**

- Pull Request 标题和说明；
- 关键页面截图；
- 主要交互说明；
- 需要审核者重点确认的问题。

**用于现场展示：**

- 5–8 分钟现场展示提纲。

Agent 可以在仓库外部新建 `PR_MATERIALS/` 目录，生成以下草稿：

- `PR_MATERIALS/01-pr-title-and-description.md` — PR 标题和说明
- `PR_MATERIALS/02-screenshots` — 关键页面截图
- `PR_MATERIALS/03-interactions.md` — 主要交互说明
- `PR_MATERIALS/04-review-questions.md` — 需审核者重点确认的问题
- `PR_MATERIALS/05-presentation-outline.md` — 5–8 分钟现场展示提纲

参与者确认后，Agent 将前 4 项整合进 Pull Request 的说明；现场展示提纲仅供参与者展示时使用，不纳入 PR。`PR_MATERIALS/` 不提交到仓库。

## 1. 技术步骤（Agent 自动执行）

- 推送分支和创建 Pull Request 前，必须向参与者展示最终改动范围、验证结果和待提交内容，并获得确认；
- 确认后可以协助推送个人分支和创建 Pull Request，不得直接推送 `main`。

汇报 PPT 不进入 GitHub 提交流程，由同学按照考核通知通过飞书提交。

## 2. 检查失败处理

Pull Request 检查失败时必须先读日志：如果失败发生在仓库校验、构建或范围检查步骤，修复项目后再推送；如果失败发生在获取运行器、下载官方 Action 或访问 GitHub 服务阶段，先查看 GitHub Status，待服务恢复后使用 `Re-run jobs`，不得把平台故障误判为作品错误。
