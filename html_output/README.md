# HTML Output

所有论文教程统一放在这里，一份论文实现一个目录，目录名为论文名称（论文全称小写加下划线）：

```text
html_output/<paper-name>/
```

例如 `deep_residual_learning_for_image_recognition`。

请不要直接把 `<paper-short-name>_output/` 随意拖入本目录；优先使用仓库根目录的 `npm run import -- ...`，它会排除 `node_modules/` 和 `dist/`，并生成标准 `paper.json`。
