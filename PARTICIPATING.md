# 参与指南

## 1. 允许重复论文

当前阶段不要求预先认领论文。同一篇论文可以由不同参与者制作多份实现，合并到 `main` 时用来源后缀区分：

```text
html_output/resnet_zhangsan/
html_output/resnet_team-a/
```

其中 `paperSlug` 表示论文，`source` 表示来源分支、团队或参与者。两者只能使用小写字母、数字和中间连字符；最终目录 ID 固定为 `paperSlug_source`。

## 2. 使用 paper-skill 生成

`paper-skill/` 是共享生成规范。普通论文参与者不得修改它。推荐在独立工作目录完成生成与迭代，然后通过根目录导入脚本收集成果。

Skill 默认生成：

```text
<paper-short-name>_output/
```

仓库接收格式：

```text
html_output/<paper-slug>_<source>/
```

## 3. 每篇论文必须包含

```text
html_output/<paper-slug>_<source>/
├── paper.json
├── README.md
├── package.json
├── package-lock.json
├── index.html
├── vite.config.ts
├── tsconfig.json
├── public/
└── src/
```

`paper.json` 必须符合 `schemas/paper.schema.json` 的字段约定。`slug` 必须等于 `paperSlug + "_" + source` 并与目录名一致；`sourceBranch` 记录原始参与分支。同一 `paperUrl` 可以重复。

禁止提交：

- `node_modules/`
- `dist/`
- 本地缓存、日志或编辑器配置
- 论文 PDF（除非维护者明确批准）
- 未获授权的图片或数据

## 4. 分支与 Pull Request

分支命名：

```text
paper/<paper-slug>-<github-user>
```

一份 PR 原则上只能触碰一个来源实现：

```text
html_output/<paper-slug>_<source>/
catalog/papers.json
```

`catalog/papers.json` 由 `npm run catalog` 生成。普通参与任务不得同时修改 `paper-skill/`、管理脚本或其他论文目录。

## 5. 本地验收

在仓库根目录执行：

```powershell
npm run validate
npm run catalog
npm run build:site
```

提交前还应人工确认：

- 页面中文表达自然；
- 论文事实、公式、实验数字和局限准确；
- 所有主要交互均可操作；
- 移动端没有明显溢出；
- 图片来源和论文链接可追溯；
- 页面中没有个人隐私、密钥或本地绝对路径。

## 6. 审核分工

- 工程审核：目录、构建、交互、资源路径和部署。
- 内容审核：论文结论、公式、数字、中文教学质量和引用。
- 维护者：确认 CI 和审核通过后合并。
