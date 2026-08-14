# Paper Skill : 1分钟理解论文内核——论文交互网页生成Skill

本仓库用于组织 AI 与机器学习等交互式论文学习网页考核，并集中收录同学们制作的交互式论文学习网页。

## 📋流程

选手打开自己的智能体应用（例如 Codex、WorkBuddy 等），输入论文并调用本仓库的 [paper-skill 技能](paper-skill) -> 生成初版待修改网页 -> 选手理解论文、打磨修改网页 -> 将成品网页提交到本仓库的 html_output。

>注：调用 paper-skill 只是为了快速做出网页雏形方便修改，通常无法一步到位做到直观理解论文，需要共创者提供更好的创意，并且可不受 paper-skill 输出的章节结构、UI 样式等限制自由调整。

最终成果必须以完整的 React + TypeScript（Vite）网页项目形式提交，禁止提交单 HTML 文件，必须包含能够安装、运行和构建的完整项目结构，仓库会将其构建为可访问的网页。

## 🖼️成品示例

**观看成品网页效果：** [▶️演示视频（仅供参考）](https://my.feishu.cn/file/G0akbSBtYoIBoLx0DEMcJSbunEg)

`html_output`目录存放了两个示例网页：
- `elf_example`：演示视频同款网页，经过了人工修改
- `resnet_example`：paper-skill 原始输出，未经过人工修改

**在线查看已提交的论文教程网页集：** 🌐https://reducttech.github.io/PaperSkill/#search

## 🚀快速开始

#### 方式一 · 手动命令行

手动下载仓库、调用 paper-skill 生成网页、修改并提交 PR。完整的操作流程请阅读👉[完整流程](https://reducttech.github.io/PaperSkill/#start)

#### 方式二 · 智能体自动下载

支持智能体自动下载仓库、调用 skill、提交 PR 等。需要将论文 PDF、LaTeX 或论文链接连同下面这条完整指令发送给支持 Skill 的 Agent：

```text
请访问仓库 https://github.com/ReductTech/PaperSkill，首先读取 docs/AGENT_WORKFLOW.md（菜单模式），不必读取项目中的其他源码，先向我展示功能菜单，由我选择要执行的功能。
```

#### 📝初版完成后，你需要做什么

Agent 生成网页初版并完成基础检查后，这一步就结束了。接下来请你根据自己对论文的深度理解，核查和修改网页，调整故事线等，不要直接提交。

你可以重点检查这些内容：

- ✅使用者是否能高效、快速理解论文内核；
- ✅论文内容是否准确；
- ✅讲解顺序是否清楚；
- ✅交互、图示和页面是否真正帮助理解。

新增内容不受限制，例如可以自由插入GIF或者Seedance/MiniMaxH3制作的小动画。
修改完成后，继续执行导入仓库、校验和 Pull Request 准备。

具体评分要求见📌[评分标准](docs/RUBRIC.md)。

## ⚙️系统支持

支持 Windows、macOS 和 Linux。本地环境需要准备 Node.js 20+、npm、Git。

>在方式二 · 智能体自动下载中，环境准备会根据当前系统自动选择对应安装方式。系统差异只影响安装过程，不影响后续生成、构建、校验和提交流程。除必要授权和确认外，其余步骤可由 Agent 自动完成。

另外，需要一个能使用 skill 的智能体应用，例如 Codex（ChatGPT）、WorkBuddy、Claude Code、Trae Work 等。

## 📂仓库结构

```text
PaperSkill/
|-- docs/               # 当前流程、参与、提交和评分说明
|-- paper-skill/        # 网页生成 Skill，选手需要调用它来生成初版网页，由核心维护者维护
|-- html_output/        # 参与者最终教程项目的统一提交目录
|-- catalog/            # 自动生成的论文索引
|-- portal/             # GitHub Pages 集合入口
|-- scripts/            # 环境配置、导入、验证、索引和构建工具
`-- .github/            # PR 模板、检查和部署流程
```

`main` 只通过 Pull Request 合并。自动检查负责工程门槛，论文事实、教学质量和人工修改仍需人工审核。

参与者的最终网页项目统一提交到 `html_output/<paper-slug>_<source>/`。不要修改 `html_output/` 的目录名称，也不要将项目直接放在仓库根目录。

Pull Request 检查失败时，先打开检查详情区分“项目校验失败”和“GitHub Actions 服务异常”。具体判断与重新运行步骤见 [参与指南的检查处理说明](docs/PARTICIPATING.md#7-pull-request-检查失败时)。
