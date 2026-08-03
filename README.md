# Paper Skill : 论文教学网页生成Skill

本仓库用于组织 AI 与机器学习论文交互教程考核，并集中收录同学们完成的简体中文 React + TypeScript 教学项目。

考核重点是准确理解论文、发现初版问题，并将人工修改落实到最终教程中，而不只是生成页面。

**在线入口：** [打开论文交互教程集合，从参与步骤开始](https://1223bettyyang.github.io/PaperSkill/#start)

## 快速流程

1. 阅读 [环境准备](doc/SETUP.md)，完成 Node.js、Git、GitHub 和 Skill 配置；
2. 选择一篇机器学习或人工智能论文，在独立工作目录中调用 `paper-skill/`；
3. 获得 `<paper-short-name>_output/` React + TypeScript 项目；
4. 对照原论文核查内容，并完成至少三项实质性修改；
5. 按 [参与指南](doc/PARTICIPATING.md) 导入、检查并通过 Pull Request 提交项目；
6. 按 [提交说明](doc/SUBMISSION.md) 另行提交论文和一页修改说明，并使用最终教程完成 5–8 分钟展示。

## 使用文档

| 文档 | 内容 |
| --- | --- |
| [SETUP.md](doc/SETUP.md) | 环境、仓库权限和 Skill 安装 |
| [PARTICIPATING.md](doc/PARTICIPATING.md) | 分支、目录、导入、校验和 PR |
| [SUBMISSION.md](doc/SUBMISSION.md) | GitHub 与考核外部材料的提交位置 |
| [RUBRIC.md](doc/RUBRIC.md) | 评分权重和实质性修改标准 |
| [REVIEWING.md](doc/REVIEWING.md) | 工程审核、内容审核和发布状态 |
| [ASSET_AND_PRIVACY.md](doc/ASSET_AND_PRIVACY.md) | 素材授权和参与者公开信息 |
| [CHANGELOG.md](doc/CHANGELOG.md) | Skill 版本历史和升级规则 |
| [LICENSE](LICENSE) | 仓库原创代码和文档的软件许可证 |

## 仓库结构

```text
PaperSkill/
|-- doc/                # 环境、参与、提交、评分和审核说明
|-- paper-skill/        # 共享生成 Skill，由核心维护者维护
|-- html_output/        # 已收录的论文教程
|-- catalog/            # 自动生成的论文索引
|-- portal/             # GitHub Pages 集合入口
|-- scripts/            # 导入、验证、索引和构建工具
`-- .github/            # PR 模板、检查和部署流程
```

`main` 只通过 Pull Request 合并。自动检查负责工程门槛，论文事实、教学质量和人工修改仍需人工审核。
