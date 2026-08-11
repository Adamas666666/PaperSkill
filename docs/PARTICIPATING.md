# 参与指南

本文只规定作品进入 GitHub 仓库的技术流程。参与者的完整教程项目统一提交到 `html_output/<paper-slug>_<source>/`，不得放在仓库根目录或其他目录。完整自动化流程见 [AGENT_WORKFLOW.md](AGENT_WORKFLOW.md)，考核材料去向见 [SUBMISSION.md](SUBMISSION.md)。

## 1. 论文与目录标识

当前阶段不要求预先认领论文。同一篇论文可以由不同参与者制作多份实现，使用来源后缀区分：

```text
html_output/resnet_zhangsan/
html_output/resnet_team-a/
```

`paperSlug` 表示论文，`source` 表示参与者、团队或来源分支。两者只能使用小写字母、数字和中间连字符；最终目录固定为 `<paperSlug>_<source>`。

## 2. 生成项目

`paper-skill/` 是共享生成规范，普通参与者不得修改。请在仓库外的独立工作目录中调用 Skill，生成：

```text
<paper-short-name>_output/
```

完成论文核查和人工修改后，再通过下方导入命令将完整项目复制到本仓库的 `html_output/` 目录。不要手动只提交生成项目中的单个 `index.html`。

## 3. 创建分支并导入

分支命名：

```text
paper/<paper-slug>-<github-user>
```

在仓库根目录运行：

```powershell
npm run import -- <生成目录> <paper-slug> --source <来源标识> --source-branch <来源分支> --title "英文论文名" --paper-url "论文链接" --participant "姓名" --github "GitHub用户名"
```

导入后生成：

```text
html_output/<paper-slug>_<source>/
```

该目录就是作品在 GitHub 中的最终提交位置。后续修改也应在这个目录内完成。

## 4. 项目结构

每篇教程必须包含：

```text
html_output/<paper-slug>_<source>/
|-- paper.json
|-- README.md
|-- package.json
|-- package-lock.json
|-- index.html
|-- vite.config.ts
|-- tsconfig.json
|-- public/
`-- src/
```

`paper.json` 必须符合 `schemas/paper.schema.json`，并由导入脚本自动生成。参与者无需填写或修改仓库内部追踪字段。其中：

- `slug` 必须等于 `paperSlug + "_" + source` 并与目录名一致；
- `sourceBranch` 记录参与分支；
- 同一 `paperUrl` 可以有多个来源实现。

不得提交 `node_modules/`、`dist/`、本地缓存、论文 PDF、密钥、个人隐私或未获授权的素材。使用论文图片或其他外部素材时，应在项目 `README.md` 中注明来源并确认允许公开使用。

## 5. 本地验收

在仓库根目录执行：

```powershell
npm run validate
npm run catalog
npm run validate:pr -- main
npm run build:site
```

`npm run validate:pr` 在普通本地终端中没有 Pull Request 基准信息，会主动跳过；本地验收必须显式追加 `-- main`。

还应人工确认：

- 页面中文表达自然，论文事实、公式、实验数字和局限准确；
- 所有主要交互均可操作，移动端没有明显溢出；
- 图片来源和论文链接可追溯；
- 页面中没有个人隐私、密钥或本地绝对路径。

## 6. 创建 Pull Request

一份参与者 PR 原则上只修改：

```text
html_output/<paper-slug>_<source>/
catalog/papers.json
```

普通参与任务不得同时修改 `paper-skill/`、管理脚本、工作流或其他论文目录。检查通过后推送个人分支并创建 Pull Request，不要直接推送 `main`。

Pull Request 创建后，作品保持 `review` 状态。工程和内容检查通过后，根据审核意见将 `paper.json` 中的 `status` 改为 `published`，重新运行 `npm run catalog` 并推送到原 Pull Request。

## 7. Pull Request 检查失败时

先点击失败检查的名称或 `View details` 查看日志，不要仅根据红色叉号修改项目：

- 日志已经执行到 `validate`、`catalog:check`、`validate:pr` 或 `build:site`：按具体报错修改项目，再提交新的分支提交；
- 日志停在等待托管运行器、下载 `actions/checkout`、`Service Unavailable` 或 GitHub API 错误：这是平台服务问题，先查看 [GitHub Status](https://www.githubstatus.com/)；
- GitHub Actions 恢复后，在检查详情页选择 `Re-run jobs`，无需创建重复提交；
- 检查变成绿色后再合并 Pull Request。不要为了绕过检查直接推送 `main`。
