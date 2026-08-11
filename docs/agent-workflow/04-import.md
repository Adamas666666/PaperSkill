# 功能四：将最终修改后的项目导入主仓库

人工修改完成后，Agent 应直接执行以下导入与校验：

1. 比较当前 `package.json` 和依赖锁文件与首次安装后的内容指纹：如果文件集合和内容均未变化且 `node_modules/` 仍可用，跳过依赖安装；如果任一文件新增、删除或改变，或者 `node_modules/` 缺失，则重新执行 `npm install`；
2. 无论是否跳过安装，都必须重新执行 `npm run build` 和页面测试。若跳过安装后构建因依赖缺失或损坏失败，应自动执行一次 `npm install` 后重新构建；
3. 再次让参与者确认公开展示名、GitHub 用户名、`paperSlug` 和 `source`，并提供最终演示 PPT 的本地路径；
4. 确认 PPT 文件存在且为有效的 `.pptx` 文件；若参与者提供的是旧版 `.ppt`，应先转换为 `.pptx`，不得只修改扩展名；
5. 在作品仓库中创建 `paper/<paper-slug>-<github-user>` 分支；
6. 按 `docs/PARTICIPATING.md` 运行 `npm run import -- ...`；
7. 确认项目进入 `html_output/<paper-slug>_<source>/`，保持 `html_output/` 和作品目录名称不变，再将 PPT 复制到该目录并统一命名为 `presentation.pptx`；
8. 检查 `paper.json`、论文链接、参与者信息、来源分支和内部追踪字段；
9. 在仓库根目录运行：

   ```powershell
   npm run validate
   npm run catalog
   npm run validate:pr -- main
   npm run build:site
   ```

10. 检查本次分支原则上只修改目标作品目录和 `catalog/papers.json`；
11. 确认目标作品目录中包含可正常打开的 `presentation.pptx`；
12. 确认仓库中没有密钥、隐私、本地绝对路径或未授权素材。
