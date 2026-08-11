# 功能四：将最终修改后的项目导入主仓库

人工修改完成后，Agent 应直接执行以下导入与校验，**不索取、不核对修改说明草稿**：

1. 比较当前 `package.json` 和依赖锁文件与首次安装后的内容指纹：如果文件集合和内容均未变化且 `node_modules/` 仍可用，跳过依赖安装；如果任一文件新增、删除或改变，或者 `node_modules/` 缺失，则重新执行 `npm install`；
2. 无论是否跳过安装，都必须重新执行 `npm run build` 和页面测试。若跳过安装后构建因依赖缺失或损坏失败，应自动执行一次 `npm install` 后重新构建；
3. 再次让参与者确认公开展示名、GitHub 用户名、`paperSlug` 和 `source`；
4. 在作品仓库中创建 `paper/<paper-slug>-<github-user>` 分支；
5. 按 `docs/PARTICIPATING.md` 运行 `npm run import -- ...`；
6. 确认项目进入 `html_output/<paper-slug>_<source>/`；
7. 检查 `paper.json`、论文链接、参与者信息、来源分支和内部追踪字段；
8. 在仓库根目录运行：

   ```powershell
   npm run validate
   npm run catalog
   npm run validate:pr -- main
   npm run build:site
   ```

9.  检查本次分支原则上只修改目标作品目录和 `catalog/papers.json`；
10. 确认仓库中没有论文 PDF、密钥、隐私、本地绝对路径或未授权素材。
