# 文档索引

以下四份文件是当前仓库的完整文档入口：

| 文件 | 使用者 | 用途 |
| --- | --- | --- |
| [AGENT_WORKFLOW.md](AGENT_WORKFLOW.md) | Agent | 菜单模式入口：展示功能菜单并逐步执行；各功能详细步骤见 [agent-workflow/](agent-workflow/) 目录 |
| [RUBRIC.md](RUBRIC.md) | 参与者、教师 | 评分权重和至少三项实质性修改的判定标准 |
| [PARTICIPATING.md](PARTICIPATING.md) | Agent、参与者 | 分支、完整项目导入、本地校验、Pull Request 和失败处理 |
| [SUBMISSION.md](SUBMISSION.md) | 参与者、教师 | GitHub 作品与考核外部材料的提交边界 |

Agent 采用菜单模式：先读取 `AGENT_WORKFLOW.md` 展示功能菜单，参与者选择功能后，Agent 读取 `docs/agent-workflow/` 下对应文件执行。

参与者通常只需先看仓库根目录的 `README.md` 和 `RUBRIC.md`。其余文件由 Agent 按执行阶段读取；遇到 GitHub 提交或自动检查问题时，再查看 `PARTICIPATING.md`。
