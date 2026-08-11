# 提交说明

## 1. 提交内容

GitHub 仓库接收可以运行和构建的完整 React + TypeScript 最终教程项目，统一提交到：

```text
html_output/<paper-slug>_<source>/
```

作品目录应包含 `package.json`、`src/`、`public/`、`paper.json` 等完整项目文件，不能只提交单独的 HTML 文件。项目不得放在仓库根目录、`docs/` 或其他位置。

用于展示的演示 PPT 也必须放入同一作品目录，与网页项目一起提交，并统一命名为 `presentation.pptx`。`html_output/` 及作品目录的名称不得因此改变。

分支、导入、目录和检查命令统一见 [PARTICIPATING.md](PARTICIPATING.md)。Pull Request 应附关键页面截图、主要交互说明和需要审核者重点确认的问题。

项目不得包含未获授权的素材、密钥、个人隐私或本地绝对路径；使用论文图片或其他外部素材时，应在项目 `README.md` 中注明来源。

## 2. 提交检查

- [ ] 项目已按参与指南通过检查并创建 Pull Request；
- [ ] 演示 PPT 已命名为 `presentation.pptx` 并放入对应作品目录；
- [ ] Pull Request 已附截图和交互说明；
- [ ] 素材来源已注明，仓库中不含个人隐私、密钥或本地绝对路径。
