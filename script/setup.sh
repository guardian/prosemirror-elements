DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$DIR")"

setupNginx() {
  echo -e "\033[32mSetting up Nginx mapping\033[0m\n"
  dev-nginx setup-app ${ROOT_DIR}/nginx/dev-nginx.yaml
}

installYarn() {
  echo -e "\033[32mInstalling JS dependencies\033[0m\n"
  yarn
}

main() {
  setupNginx
  installYarn
  echo -e "\033[32mInstallation complete.\033[0m\n"
}

main