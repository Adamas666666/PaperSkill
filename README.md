# Paper Tutorial Collection

这是一个面向多人协作的AI类论文交互网页生成的skill仓库。`paper-skill/` 是稳定的 meta-skill；请同学使用它生成单篇 React + TypeScript 教程，在此过程中可以对网页进行易懂化优化修改（请保持文件夹结构与skill生成的最初版一致,格式与网页质量可以参考文件夹下的网页示例ELF），截止日期前将成果统一提交到 `html_output/<paper-slug>_<source>/`。

## 仓库分工

- `paper-skill/`：生成单篇论文教程的 Skill，仅由核心维护者修改
- `html_output/`：已收集的论文教程，每份来源实现一个独立目录。
- `catalog/papers.json`：由脚本生成的论文索引，禁止手工编辑。
- `portal/`：统一浏览入口，发布后链接到每篇独立教程。
- `scripts/`：导入、验证、索引和构建工具。
- `.github/`：PR 检查和 GitHub Pages 发布流程。

## 同学们的快速启动方式

1. 安装 `paper-skill/`，在个人工作目录调用 `$paper-skill` 生成 `<paper-short-name>_output/`。
2. 创建参与分支，例如 `paper/(paper)-yourname`。
3. 选择一个来源标识 `source`，通常使用 GitHub 用户名、团队名或分支简称。
4. 将生成结果导入本仓库：

```powershell
npm run import -- <生成目录> <paper-slug> --source <来源标识> --source-branch <来源分支> --title "英文论文名" --paper-url "论文链接" --participant "姓名" --github "GitHub用户名"
```

示例：

```powershell
npm run import -- .\resnet_output resnet --source zhangsan --source-branch paper/resnet-zhangsan --title "Deep Residual Learning for Image Recognition" --paper-url "https://arxiv.org/abs/1512.03385" --participant "张三" --github "zhangsan"
```

5. 检查并构建：

```powershell
npm run validate
npm run catalog
npm run build:site
```

6. 提交分支并创建 Pull Request。不要直接推送 `main`。

详细规范见 [PARTICIPATING.md](PARTICIPATING.md)。

## 本地查看

查看某一篇教程：

```powershell
cd html_output\resnet_example
npm install
npm run dev
```

构建完整集合站：

```powershell
npm run build:site
```

生成结果位于忽略提交的 `site/`：

```text
site/index.html
site/papers/<paper-slug>_<source>/index.html
```

建议通过本地静态服务器预览 `site/`，不要直接双击入口文件。

仓库级构建会统一执行 TypeScript 检查和 Vite 构建；参与者不需要修改单篇项目的构建配置。

## 维护原则

- `main` 应开启分支保护，只允许 Pull Request 合并。
- 一份 PR 原则上只新增或修改一个来源实现目录。
- 不提交 `node_modules/`、`dist/` 或仓库级 `site/`。
- `paper-skill/` 的修改与论文内容参与任务分开提交。
- GitHub Actions 是合并前的工程门槛；论文事实、公式和讲解质量仍需人工审核。
