#!/usr/bin/env bash
# 部署静态站点到自有服务器（备案通过后使用）
#
# 用法：
#   SERVER_HOST=user@your-domain.com SERVER_PATH=/var/www/blog ./scripts/deploy-server.sh
#
# 可选环境变量：
#   SERVER_PORT (默认 22)
#   RSYNC_EXTRA (额外 rsync 参数)
set -euo pipefail

: "${SERVER_HOST:?请设置 SERVER_HOST，例如 user@your-domain.com}"
: "${SERVER_PATH:=/var/www/blog}"
SERVER_PORT="${SERVER_PORT:-22}"

DIST_DIR="$(cd "$(dirname "$0")/../site/dist" && pwd)"
if [[ ! -f "$DIST_DIR/index.html" ]]; then
  echo "错误：site/dist 不存在，请先执行 (cd site && npm run build)" >&2
  exit 1
fi

echo "==> 部署 $DIST_DIR -> $SERVER_HOST:$SERVER_PATH"

ATTEMPTS=0
MAX=3
until rsync -avz --delete \
      -e "ssh -p $SERVER_PORT" \
      ${RSYNC_EXTRA:-} \
      "$DIST_DIR/" "$SERVER_HOST:$SERVER_PATH/"; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [[ $ATTEMPTS -ge $MAX ]]; then
    echo "错误：rsync 连续失败 $MAX 次" >&2
    exit 1
  fi
  echo "rsync 失败，重试 $ATTEMPTS/$MAX ..." >&2
  sleep 3
done

echo "==> 部署完成"
echo "    回滚说明：如需回滚，请在服务器上恢复上一版本备份目录（建议部署前自行 tar 备份 $SERVER_PATH）"
