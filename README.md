# Paper Skill 论文交互教程考核与作品集

本仓库用于组织 AI 与机器学习论文交互教程考核，并集中收录同学们完成的 React + TypeScript 教学项目。

每位同学选择一篇论文，使用 `paper-skill/` 生成初版教程，再对照原论文完成人工核查和实质性修改，最后通过 Pull Request 提交成果。考核重点是论文理解、内容准确性、教学设计和修改质量，而不只是生成页面。

**在线入口：** [打开论文交互教程集合，从参与步骤开始](https://1223bettyyang.github.io/PaperSkill/#start)

## 仓库结构

```text
PaperSkill/
|-- paper-skill/        # 生成单篇论文教程的 Skill，由核心维护者维护
|-- html_output/        # 已收录的论文教程
|-- catalog/            # 由脚本生成的论文索引
|-- portal/             # 教程集合的统一浏览入口
|-- scripts/            # 导入、验证、索引和构建工具
`-- .github/            # PR 检查和 GitHub Pages 发布流程
```

`catalog/papers.json` 由脚本生成，请勿手工编辑。

## 参与流程

### 1. 生成教程

选手可自行选择支持 Skill 的 Agent，例如 Codex。安装完整的 `paper-skill/`，提供论文 PDF，并输入：

```text
请使用 paper-skill，将我提供的论文制作成一个简体中文交互式教学项目。
请连续完成论文分析、教学设计、项目生成和检查，并在完成后告诉我最终输出目录。
```

初始输出为 React + TypeScript 项目：

```text
<paper-short-name>_output/
|-- contract.md
|-- public/
|-- src/
|-- package.json
`-- ...
```

`public/` 用于存放论文原始图片及人工修改时增加的外部资源；公共约定统一写入 `contract.md`。请保持生成项目的基本目录结构和构建配置不变。

### 2. 核查并修改

对照原论文检查事实、公式、实验数据、结论和引用，并完成至少三项实质性修改。有效修改包括：

- 纠正论文内容或公式错误；
- 重写难以理解的讲解；
- 修复无效或误导性的交互；
- 调整教学逻辑或页面布局。

仅修改文件名、标点或无关装饰不计入实质性修改。

### 3. 导入作品仓库

1. 创建参与分支，例如 `paper/<paper-slug>-<yourname>`。
2. 选择来源标识 `source`，通常使用 GitHub 用户名、团队名或分支简称。
3. 在仓库根目录运行导入命令：

```powershell
npm run import -- <生成目录> <paper-slug> --source <来源标识> --source-branch <来源分支> --title "英文论文名" --paper-url "论文链接" --participant "姓名" --github "GitHub用户名"
```

示例：

```powershell
npm run import -- .\resnet_output resnet --source zhangsan --source-branch paper/resnet-zhangsan --title "Deep Residual Learning for Image Recognition" --paper-url "https://arxiv.org/abs/1512.03385" --participant "张三" --github "zhangsan"
```

导入后，作品位于：

```text
html_output/<paper-slug>_<source>/
```

### 4. 检查并提交

```powershell
npm run validate
npm run catalog
npm run build:site
```

检查通过后提交参与分支并创建 Pull Request，请勿直接推送 `main`。详细协作规范见 [PARTICIPATING.md](PARTICIPATING.md)。

## 本地查看

查看单篇教程：

```powershell
cd html_output\resnet_example
npm install
npm run dev
```

构建完整集合站：

```powershell
npm run build:site
```

生成结果位于本地 `site/` 目录。请使用本地静态服务器预览，不要直接双击入口文件。

## 作品与考核要求

- 项目结构完整，能够正常安装、启动和构建；
- 论文内容、公式、实验数据和结论准确；
- 教学逻辑清楚，主要交互可以正常使用；
- 至少完成三项实质性人工修改；
- 能够使用最终项目完成 5–8 分钟的论文讲解。

除仓库中的项目成果外，考核还需另行提交原论文 PDF 或有效链接，以及一页以内的修改说明，列出至少三项实质性修改及原因。上述考核材料不提交到本仓库；未经维护者明确批准，禁止将论文 PDF 纳入 Pull Request。

评价维度包括论文理解、内容准确性、教学设计、交互效果、页面完成度、人工修改质量和现场展示表现。

## 维护原则

- `main` 只通过 Pull Request 合并；
- 一份 PR 原则上只新增或修改一个来源实现目录；
- 不提交 `node_modules/`、`dist/` 或仓库级 `site/`；
- `paper-skill/` 的修改与论文作品提交分开进行；
- 自动检查负责工程质量，论文事实、公式和讲解质量仍需人工审核。
