# Changelog

本文件记录 Paper Skill 和仓库工作流的重要变化。版本号遵循语义化版本 `主版本.次版本.修订版本`。

当前正式 Skill 版本以 `paper-skill/VERSION` 为唯一来源。导入脚本读取该文件写入每篇作品的 `paper.json.skillVersion`，不得在多个脚本中重复硬编码版本号。

## [Unreleased]

### Added

- 增加环境准备、提交、评分和审核说明；
- 增加统一的 `paper-skill/VERSION` 版本来源；
- Pull Request 模板增加实质性修改、外部材料、素材来源和公开信息确认项。

## [1.0.0] - 2026-08-03

### Added

- 建立两阶段论文分析与教程生成流程；
- 输出自包含的 React + TypeScript + Vite 项目目录；
- 提供统一教程模板、论文专属数据、Canvas 交互模块和结构验证器；
- 提供作品导入、仓库验证、目录索引和集合站构建脚本；
- 提供 Pull Request 自动检查和 GitHub Pages 自动部署；
- 发布 ResNet 示例教程和在线参与步骤生成器。

## 版本更新规则

- **修订版本**：修复错误、补充说明或进行不改变输出协议的改进；
- **次版本**：新增兼容能力、交互模式、字段或可选功能；
- **主版本**：更改输出目录、数据结构或其他不兼容协议。

发布新版本时：

1. 更新 `paper-skill/VERSION`；
2. 将 `Unreleased` 内容整理到带日期的新版本标题下；
3. 检查导入生成的 `paper.json.skillVersion`；
4. 运行仓库验证和构建；
5. 创建 Git 标签并发布版本说明。
