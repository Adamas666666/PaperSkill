# 环境准备

本文用于完成 PaperSkill 考核开始前的环境配置。完成本页检查后，再进入论文选择、教程生成、人工修改和作品提交阶段。

## 1. 安装基础工具

请提前准备：

- **Node.js 20 或更高版本**，同时包含 `npm`；
- **Git**；
- 一个可以正常使用的 **GitHub 账号**；
- 一个支持安装和调用 Skill 的 Agent；
- 可以读取论文并写入项目文件的本地工作目录。

在终端中检查环境：

```powershell
node --version
npm --version
git --version
```

`node --version` 应显示 `v20` 或更高版本。

## 2. 准备 GitHub 权限

根据仓库权限选择一种方式。

### 方式 A：已获得仓库写入权限

直接克隆官方仓库：

```powershell
git clone https://github.com/1223BETTYYANG/PaperSkill.git
cd PaperSkill
```

### 方式 B：没有仓库写入权限

先在 GitHub 上 Fork `1223BETTYYANG/PaperSkill`，再克隆自己的 Fork：

```powershell
git clone https://github.com/<你的GitHub用户名>/PaperSkill.git
cd PaperSkill
git remote add upstream https://github.com/1223BETTYYANG/PaperSkill.git
```

检查远端配置和连接：

```powershell
git remote -v
git ls-remote origin
```

如果 GitHub 要求登录，请按照 GitHub 提示配置 HTTPS 凭据或 SSH 密钥。不要把密码、访问令牌或私钥写入仓库文件。

## 3. 配置 Git 身份

首次使用 Git 时设置提交信息：

```powershell
git config --global user.name "你的姓名或GitHub用户名"
git config --global user.email "你的GitHub邮箱"
```

检查配置：

```powershell
git config --global user.name
git config --global user.email
```

## 4. 安装并核对 Paper Skill 版本

选手可自行选择支持 Skill 的 Agent。开始安装前，应先确保本地仓库已同步到最新版本：

```powershell
git checkout main
git pull --ff-only
Get-Content .\paper-skill\VERSION
```

记录仓库中 `paper-skill/VERSION` 显示的版本号，然后按照所选 Agent 的安装说明，将仓库中的完整 `paper-skill/` 文件夹安装到该 Agent 的 Skill 目录。

安装时注意：

- 必须安装完整的 `paper-skill/`，不能只复制 `SKILL.md`；
- 必须保留 `assets/`、`references/`、`scripts/`、`templates/`、`contract.md` 和 `VERSION`；
- 安装后重新加载 Agent，并确认它能够识别 `paper-skill`；
- 普通参与者不要修改仓库中共享的 `paper-skill/` 内容。

安装完成后，按照所选 Agent 的安装说明找到其 Skill 目录，并读取安装版本：

```powershell
Get-Content "<Agent 的 Skill 目录>\paper-skill\VERSION"
```

安装目录与仓库中的 `VERSION` 必须完全一致。同时确认 Agent 对该 Skill 的说明为生成 React + TypeScript（Vite）项目文件夹。

完成版本核对后，重新加载或重新启动 Agent，再开始生成论文教程。

如果安装目录缺少 `VERSION`、版本号与仓库不一致，或者 Agent 无法识别 `paper-skill`，应停止生成任务，重新安装仓库中的完整 `paper-skill/` 文件夹并再次检查。

## 5. 准备论文工作目录

建议将论文生成目录与作品仓库分开，避免把临时文件直接写入 `html_output/`：

```text
工作区/
|-- PaperSkill/          # 克隆的作品仓库
`-- paper-work/          # 论文 PDF、生成结果和人工修改目录
```

在 `paper-work/` 中调用 Skill。成功后会生成：

```text
<paper-short-name>_output/
```

完成核查和人工修改后，再使用 `PaperSkill/` 根目录中的导入命令将项目收录到 `html_output/`。

## 6. 准备文件权限

运行 Agent 时，仅按任务需要授予以下权限：

- 读取论文 PDF、论文链接或可读取文本；
- 写入 `paper-work/`；
- 读取已安装的 `paper-skill/`；
- 访问 GitHub 和 npm，以便拉取代码和安装项目依赖。

不要授权 Agent 读取无关的个人目录、浏览器密码、私钥或其他敏感文件。

## 7. 环境自检

进入克隆的 `PaperSkill/` 仓库后运行：

```powershell
npm run validate
```

出现“仓库验证通过”后，再开始论文制作。

开始前请确认：

- Node.js 版本不低于 20；
- Git 和 GitHub 远端连接正常；
- 已完整安装 `paper-skill/`；
- 仓库与安装目录中的 `paper-skill/VERSION` 完全一致；
- Agent 能够识别 `paper-skill`，并说明其输出为 React + TypeScript（Vite）项目文件夹；
- Agent 可以读取论文并写入独立工作目录；
- 当前仓库已同步到最新 `main`；
- 后续工作将在个人分支中完成，不直接修改 `main`。
