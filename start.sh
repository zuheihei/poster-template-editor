#!/usr/bin/env bash
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "未检测到 Node.js，请先安装：https://nodejs.org/"
  exit 1
fi

PORT="${PORT:-5174}"
echo "正在启动图文模板编辑器..."
echo "请在浏览器打开：http://localhost:${PORT}"
echo "按 Ctrl+C 停止服务"
echo ""

PORT="$PORT" exec node server/static.js
