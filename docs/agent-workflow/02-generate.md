# 功能二：调用 paper-skill 生成网页

1. 让参与者确认论文；
2. 在仓库外创建独立工作目录，不把论文或临时文件写入 `html_output/`；
3. 调用已安装的 `paper-skill`；
4. 让 Skill 连续完成论文读取、教学规划、React + TypeScript 项目生成和结构验证；
5. 获得唯一的 `<paper-short-name>_output/` 初版项目；

生成完成后，执行依赖安装、构建与本地预览：

```powershell
npm install
npm run build
npm run dev
```
