#!/usr/bin/env bash

set -Eeuo pipefail

agent_skills_directory=""
git_name=""
git_email=""
install_missing_tools=false
replace_existing_skill=false
non_interactive=false
skip_github_check=false

usage() {
  cat <<'EOF'
Usage: ./scripts/setup-participant.sh [options]

Options:
  --agent-skills-directory PATH  Agent Skill root directory
  --git-name NAME                Git commit user name
  --git-email EMAIL              Git commit email
  --install-missing-tools        Install missing Git/Node.js with the system package manager
  --replace-existing-skill       Replace an existing paper-skill installation when it differs
  --non-interactive              Do not prompt; fail when required values are missing
  --skip-github-check            Skip the origin connectivity check
  -h, --help                     Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --agent-skills-directory)
      [[ $# -ge 2 ]] || { echo "Missing value for $1" >&2; exit 2; }
      agent_skills_directory="$2"
      shift 2
      ;;
    --git-name)
      [[ $# -ge 2 ]] || { echo "Missing value for $1" >&2; exit 2; }
      git_name="$2"
      shift 2
      ;;
    --git-email)
      [[ $# -ge 2 ]] || { echo "Missing value for $1" >&2; exit 2; }
      git_email="$2"
      shift 2
      ;;
    --install-missing-tools)
      install_missing_tools=true
      shift
      ;;
    --replace-existing-skill)
      replace_existing_skill=true
      shift
      ;;
    --non-interactive)
      non_interactive=true
      shift
      ;;
    --skip-github-check)
      skip_github_check=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

die() {
  echo >&2
  echo "Environment setup did not complete: $*" >&2
  exit 1
}

write_step() {
  printf '\n[%s/7] %s\n' "$1" "$2"
}

confirm_action() {
  local message="$1"
  if [[ "$non_interactive" == true ]]; then
    return 1
  fi
  local answer
  read -r -p "$message [Y/n] " answer
  [[ -z "$answer" || "$answer" =~ ^[Yy]([Ee][Ss])?$ ]]
}

allow_install() {
  local label="$1"
  [[ "$install_missing_tools" == true ]] || confirm_action "$label is missing or outdated. Install it now?"
}

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
repo_root="$(cd "$script_dir/.." && pwd -P)"
skill_source="$repo_root/paper-skill"
required_skill_items=(SKILL.md contract.md VERSION assets references scripts templates)

case "$(uname -s)" in
  Darwin) platform="macos" ;;
  Linux) platform="linux" ;;
  *) die "This script supports macOS and Linux. Use setup-participant.ps1 on Windows." ;;
esac

run_as_root() {
  if [[ "$(id -u)" -eq 0 ]]; then
    "$@"
  elif command -v sudo >/dev/null 2>&1; then
    sudo "$@"
  else
    die "Administrator permission is required, but sudo is unavailable."
  fi
}

refresh_homebrew_path() {
  local brew_bin=""
  if [[ -x /opt/homebrew/bin/brew ]]; then
    brew_bin=/opt/homebrew/bin/brew
  elif [[ -x /usr/local/bin/brew ]]; then
    brew_bin=/usr/local/bin/brew
  fi
  if [[ -n "$brew_bin" ]]; then
    eval "$($brew_bin shellenv)"
  fi
}

ensure_homebrew() {
  refresh_homebrew_path
  command -v brew >/dev/null 2>&1 && return
  allow_install "Homebrew" || die "Homebrew is required to install missing tools on macOS."
  command -v curl >/dev/null 2>&1 || die "curl is required to download the official Homebrew installer."

  if ! xcode-select -p >/dev/null 2>&1; then
    xcode-select --install >/dev/null 2>&1 || true
    die "Complete the Xcode Command Line Tools installation, then run setup again."
  fi

  local installer
  installer="$(mktemp)"
  curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh -o "$installer"
  if [[ "$non_interactive" == true ]]; then
    NONINTERACTIVE=1 /bin/bash "$installer"
  else
    /bin/bash "$installer"
  fi
  rm -f -- "$installer"
  refresh_homebrew_path
  command -v brew >/dev/null 2>&1 || die "Homebrew was installed but is not visible in this terminal."
}

detect_linux_package_manager() {
  local candidate
  for candidate in apt-get dnf yum pacman zypper apk; do
    if command -v "$candidate" >/dev/null 2>&1; then
      printf '%s\n' "$candidate"
      return
    fi
  done
  die "No supported Linux package manager was found (apt-get, dnf, yum, pacman, zypper, apk)."
}

install_linux_git() {
  local manager="$1"
  case "$manager" in
    apt-get) run_as_root apt-get update; run_as_root apt-get install -y git ;;
    dnf) run_as_root dnf install -y git ;;
    yum) run_as_root yum install -y git ;;
    pacman) run_as_root pacman -Sy --noconfirm git ;;
    zypper) run_as_root zypper --non-interactive install git ;;
    apk) run_as_root apk add git ;;
  esac
}

install_linux_node() {
  local manager="$1"
  case "$manager" in
    apt-get)
      run_as_root apt-get update
      run_as_root apt-get install -y ca-certificates curl gnupg
      local node_setup
      node_setup="$(mktemp)"
      curl -fsSL https://deb.nodesource.com/setup_20.x -o "$node_setup"
      run_as_root bash "$node_setup"
      rm -f -- "$node_setup"
      run_as_root apt-get install -y nodejs
      ;;
    dnf)
      run_as_root dnf module reset -y nodejs || true
      run_as_root dnf module enable -y nodejs:20 || true
      run_as_root dnf install -y nodejs npm
      ;;
    yum) run_as_root yum install -y nodejs npm ;;
    pacman) run_as_root pacman -Sy --noconfirm nodejs npm ;;
    zypper) run_as_root zypper --non-interactive install nodejs npm ;;
    apk) run_as_root apk add nodejs npm ;;
  esac
}

ensure_git() {
  command -v git >/dev/null 2>&1 && return
  allow_install "Git" || die "Git is required."
  if [[ "$platform" == macos ]]; then
    ensure_homebrew
    brew install git
  else
    install_linux_git "$(detect_linux_package_manager)"
  fi
  hash -r
  command -v git >/dev/null 2>&1 || die "Git was installed but is not visible in this terminal."
}

node_major_version() {
  local raw=""
  command -v node >/dev/null 2>&1 && raw="$(node --version 2>/dev/null || true)"
  if [[ "$raw" =~ ^v([0-9]+) ]]; then
    printf '%s\n' "${BASH_REMATCH[1]}"
  else
    printf '0\n'
  fi
}

ensure_node() {
  local major
  major="$(node_major_version)"
  if [[ "$major" -ge 20 ]] && command -v npm >/dev/null 2>&1; then
    return
  fi
  allow_install "Node.js 20+ and npm" || die "Node.js 20 or newer and npm are required."
  if [[ "$platform" == macos ]]; then
    ensure_homebrew
    if brew list node >/dev/null 2>&1; then
      brew upgrade node || true
    else
      brew install node
    fi
  else
    install_linux_node "$(detect_linux_package_manager)"
  fi
  hash -r
  major="$(node_major_version)"
  [[ "$major" -ge 20 ]] || die "The installed Node.js version is below 20. Install Node.js 20+ from https://nodejs.org/ and run setup again."
  command -v npm >/dev/null 2>&1 || die "npm is unavailable after installing Node.js."
}

read_git_value() {
  git config --global --get "$1" 2>/dev/null || true
}

ensure_git_identity() {
  local current_name current_email
  current_name="$(read_git_value user.name)"
  current_email="$(read_git_value user.email)"

  if [[ -n "$git_name" ]]; then
    git config --global user.name "$git_name"
    current_name="$git_name"
  fi
  if [[ -n "$git_email" ]]; then
    git config --global user.email "$git_email"
    current_email="$git_email"
  fi

  if [[ -z "$current_name" ]]; then
    [[ "$non_interactive" == false ]] || die "Git user.name is missing. Provide --git-name."
    read -r -p "Git commit user name: " current_name
    [[ -n "$current_name" ]] || die "Git user name cannot be empty."
    git config --global user.name "$current_name"
  fi
  if [[ -z "$current_email" ]]; then
    [[ "$non_interactive" == false ]] || die "Git user.email is missing. Provide --git-email."
    read -r -p "Git commit email: " current_email
    [[ -n "$current_email" ]] || die "Git email cannot be empty."
    git config --global user.email "$current_email"
  fi
  printf '%s <%s>\n' "$current_name" "$current_email"
}

sha256_file() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{print $1}'
  else
    shasum -a 256 "$1" | awk '{print $1}'
  fi
}

sha256_stream() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum | awk '{print $1}'
  else
    shasum -a 256 | awk '{print $1}'
  fi
}

skill_layout_ok() {
  local directory="$1" item
  for item in "${required_skill_items[@]}"; do
    [[ -e "$directory/$item" ]] || return 1
  done
}

skill_fingerprint() {
  local directory="$1"
  (
    cd "$directory"
    find . -type f -print | LC_ALL=C sort | while IFS= read -r relative; do
      relative="${relative#./}"
      printf '%s\t%s\n' "$relative" "$(sha256_file "$relative")"
    done
  ) | sha256_stream
}

safe_remove_staging() {
  local target="$1" skills_root="$2"
  case "$target" in
    "$skills_root"/.paper-skill-install-*|"$skills_root"/.paper-skill-backup-*) rm -rf -- "$target" ;;
    *) die "Refusing to remove an unexpected path: $target" ;;
  esac
}

install_paper_skill() {
  local skills_root="$1"
  local destination="$skills_root/paper-skill"
  local repo_version repo_fingerprint installed_version="" installed_fingerprint=""
  repo_version="$(tr -d '[:space:]' < "$skill_source/VERSION")"
  repo_fingerprint="$(skill_fingerprint "$skill_source")"

  if [[ -d "$destination" ]] && skill_layout_ok "$destination"; then
    installed_version="$(tr -d '[:space:]' < "$destination/VERSION")"
    installed_fingerprint="$(skill_fingerprint "$destination")"
  fi
  if [[ -n "$installed_version" && "$installed_version" == "$repo_version" && "$installed_fingerprint" == "$repo_fingerprint" ]]; then
    echo "Paper Skill already matches the repository."
    printf '%s\n' "$destination"
    return
  fi

  if [[ -e "$destination" && "$replace_existing_skill" == false ]]; then
    confirm_action "paper-skill already exists. Replace it with the repository copy?" || die "paper-skill was not replaced."
  fi

  local staging backup had_backup=false
  staging="$(mktemp -d "$skills_root/.paper-skill-install-XXXXXX")"
  backup="$skills_root/.paper-skill-backup-$(date +%s)-$$"
  cp -R "$skill_source/." "$staging/"
  if ! skill_layout_ok "$staging"; then
    safe_remove_staging "$staging" "$skills_root"
    die "The staged Paper Skill copy is incomplete."
  fi
  if [[ "$(skill_fingerprint "$staging")" != "$repo_fingerprint" ]]; then
    safe_remove_staging "$staging" "$skills_root"
    die "The staged Paper Skill fingerprint does not match the repository."
  fi

  if [[ -e "$destination" ]]; then
    mv "$destination" "$backup"
    had_backup=true
  fi
  if ! mv "$staging" "$destination"; then
    [[ "$had_backup" == false ]] || mv "$backup" "$destination"
    die "Could not install Paper Skill. The previous installation was restored."
  fi

  if ! skill_layout_ok "$destination" || [[ "$(skill_fingerprint "$destination")" != "$repo_fingerprint" ]]; then
    local invalid="$skills_root/.paper-skill-install-invalid-$(date +%s)-$$"
    mv "$destination" "$invalid"
    if [[ "$had_backup" == true ]]; then
      mv "$backup" "$destination"
      had_backup=false
    fi
    safe_remove_staging "$invalid" "$skills_root"
    die "The installed Paper Skill failed its layout or fingerprint check. The previous installation was restored."
  fi
  if [[ "$had_backup" == true ]]; then
    safe_remove_staging "$backup" "$skills_root"
  fi
  echo "Paper Skill installed and verified."
  printf '%s\n' "$destination"
}

echo "PaperSkill participant environment setup ($platform)"

write_step 1 "Check repository layout"
for required_path in package.json paper-skill/SKILL.md paper-skill/VERSION; do
  [[ -e "$repo_root/$required_path" ]] || die "The repository is incomplete. Missing: $required_path"
done
echo "Repository: $repo_root"

write_step 2 "Check Node.js, npm, and Git"
ensure_git
ensure_node
echo "$(node --version) | npm $(npm --version) | $(git --version)"

write_step 3 "Check Git commit identity"
git_identity="$(ensure_git_identity)"
echo "Git identity: $git_identity"

write_step 4 "Check the GitHub remote"
origin="$(git -C "$repo_root" remote get-url origin 2>/dev/null || true)"
[[ -n "$origin" ]] || die "The repository has no origin remote. Clone the official repository or a personal fork first."
echo "origin: $origin"
if [[ "$skip_github_check" == true ]]; then
  echo "Remote connection check skipped."
else
  git -C "$repo_root" ls-remote origin HEAD >/dev/null || die "Cannot connect to origin. Complete GitHub login, HTTPS credentials, or SSH setup first."
  echo "GitHub remote read check passed."
fi

write_step 5 "Resolve the Agent Skill directory"
if [[ -z "$agent_skills_directory" ]]; then
  [[ "$non_interactive" == false ]] || die "Provide --agent-skills-directory."
  read -r -p "Agent Skill root directory: " agent_skills_directory
fi
[[ -n "$agent_skills_directory" ]] || die "The Agent Skill root cannot be empty."
mkdir -p "$agent_skills_directory"
skills_root="$(cd "$agent_skills_directory" && pwd -P)"
case "$skills_root/" in
  "$repo_root"/*) die "The Agent Skill directory cannot be inside the PaperSkill repository." ;;
esac
echo "Skill root: $skills_root"

write_step 6 "Install and verify Paper Skill"
installed_path="$(install_paper_skill "$skills_root")"
echo "Installed at: $(printf '%s\n' "$installed_path" | tail -n 1)"

write_step 7 "Run repository validation"
npm --prefix "$repo_root" run validate

echo
echo "Environment setup completed. Reload the selected Agent and confirm it recognizes paper-skill."
echo "The participant must confirm GitHub authorization, fork ownership, and Agent reload."
