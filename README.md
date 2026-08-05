# Paper Skill : 论文教学网页生成Skill

本仓库用于组织 AI 与机器学习论文交互教学网页考核，并集中收录同学们制作的中文交互式论文教学网页。

最终成果以完整的 React + TypeScript（Vite）项目形式提交，仓库会将其构建为可访问的网页。

考核重点是准确理解论文、发现初版问题，并将人工修改落实到最终教程中，而不只是生成页面。

**在线入口：** https://1223bettyyang.github.io/PaperSkill/#start

## 快速开始

选择一篇机器学习或人工智能论文，将 PDF、LaTeX 或论文链接连同下面这条完整指令发送给支持 Skill 的 Agent：

```text
请获取或更新 https://github.com/1223BETTYYANG/PaperSkill，读取并严格执行 docs/AGENT_WORKFLOW.md，使用我提供的论文从环境配置开始连续完成 Paper Skill 安装、初版项目生成、依赖安装、构建和页面检查、人工修改协作、作品导入、仓库校验以及 Pull Request 准备。

能够自动执行的操作不要交还给我逐条处理。只在文档规定的账号授权、论文确认、至少三项实质性修改、最终提交确认和现场展示节点让我参与。缺少参与者信息或目录标识时集中询问，不要在其他阶段中断。未完成全部验证时不要报告流程完成。
```

整体过程为：`Agent 自动配置与生成 → 选手确认并完成实质性修改 → Agent 自动检查与准备提交 → 选手最终确认并展示`。

选手只需阅读本页和 [评分标准](docs/RUBRIC.md)。其余流程文件由 Agent 自动读取并执行，外部材料的具体提交入口以考核通知为准。

## 仓库结构

```text
PaperSkill/
|-- docs/               # Agent 流程、环境、参与、提交和评分说明
|-- paper-skill/        # 共享生成 Skill，由核心维护者维护
|-- html_output/        # 参与者最终教程项目的统一提交目录
|-- catalog/            # 自动生成的论文索引
|-- portal/             # GitHub Pages 集合入口
|-- scripts/            # 环境配置、导入、验证、索引和构建工具
`-- .github/            # PR 模板、检查和部署流程
```

`main` 只通过 Pull Request 合并。自动检查负责工程门槛，论文事实、教学质量和人工修改仍需人工审核。

参与者的最终作品统一提交到 `html_output/<paper-slug>_<source>/`。不要将项目直接放在仓库根目录，也不要把论文 PDF 或修改说明放入 `html_output/`。
