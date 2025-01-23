#!/bin/bash
USERNAME=$(whoami)
if [[ -z "$USERNAME" ]]; then
    echo "无法获取当前系统用户名，脚本退出。"
    exit 1
fi

DOMAIN="$USERNAME.serv00.net"
NODE_PORT=3000
DOMAIN_FOLDER_ROOT="/home/$USERNAME/domains"
DOMAIN_DIR="$DOMAIN_FOLDER_ROOT/$DOMAIN"
PUBLIC_NODEJS_DIR="$DOMAIN_DIR/public_nodejs"
APP_JS_PATH="$PUBLIC_NODEJS_DIR/app.js"
APP_JS_URL="https://raw.githubusercontent.com/guitar295/Serv00-Web-keepalive/refs/heads/main/app.js"

echo " ———————————————————————————————————————————————————————————— "

# 删除旧的域名（如果存在）
devil www del "$DOMAIN" > /dev/null 2>&1
if [[ $? -eq 0 ]]; then
    echo " [OK] 默认域名已成功删除。"
    echo ""
else
    echo "默认域名删除失败，可能不存在。"
    echo ""
fi

# 如果域名目录存在，则删除
if [[ -d "$DOMAIN_DIR" ]]; then
    rm -rf "$DOMAIN_DIR"
fi

# 创建新的域名
if devil www add "$DOMAIN" nodejs /usr/local/bin/node22 > /dev/null 2>&1; then
    echo " [OK] $DOMAIN 已生成。"
    echo ""
else
    echo "新域名生成失败，请检查环境配置。"
    echo ""
    exit 1
fi

# 如果 public_nodejs 文件夹不存在，则创建
if [[ ! -d "$PUBLIC_NODEJS_DIR" ]]; then
    mkdir -p "$PUBLIC_NODEJS_DIR"
fi

# 安装所需的库
if npm install dotenv basic-auth express > /dev/null 2>&1; then
    echo " [OK] 依赖已成功安装！"
    echo ""
else
    echo "依赖安装失败，请检查 Node.js 环境。"
    exit 1
fi

# 将文件夹 "public" 重命名为 "static"（如果存在）
if [[ -d "$PUBLIC_NODEJS_DIR/public" ]]; then
    mv "$PUBLIC_NODEJS_DIR/public" "$PUBLIC_NODEJS_DIR/static"
    if [[ $? -eq 0 ]]; then
        echo " [OK] 文件夹 'public' 已成功重命名为 'static'。"
    else
        echo "文件夹 'public' 重命名失败。"
        exit 1
    fi
fi

# 下载 app.js 配置文件
if curl -s -o "$APP_JS_PATH" "$APP_JS_URL"; then
    echo " [OK] 配置文件 下载成功"
else
    echo "配置文件 下载失败，请检查下载地址。"
    exit 1
fi

# 设置 app.js 文件权限
chmod 644 "$APP_JS_PATH"
if [[ $? -eq 0 ]]; then
    echo ""
else
    echo "文件权限设置失败"
    exit 1
fi

# 完成部署，显示提示信息
echo " 【 恭 喜 】： 一 键 部 署 已 完 成 。"
echo " ———————————————————————————————————————————————————————————— "
echo " |**保活网页 https://$DOMAIN/info "
echo ""
echo " |**查看节点 https://$DOMAIN/node_info "
echo ""
echo " |**输出日志 https://$DOMAIN/keepalive "
echo " ———————————————————————————————————————————————————————————— "
echo ""
