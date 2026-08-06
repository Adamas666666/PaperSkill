# HTML Output

所有论文教程统一放在这里，每份实现一个目录。同一篇论文可以有多份实现：

```text
html_output/<paper-slug>_<source>/
```

例如 `resnet_zhangsan` 与 `resnet_team-a` 可以同时存在。`source` 用于标识来源分支、团队或参与者。

请不要直接把 `<paper-short-name>_output/` 随意拖入本目录；优先使用仓库根目录的 `npm run import -- ...`，它会排除 `node_modules/` 和 `dist/`，并生成标准 `paper.json`。
