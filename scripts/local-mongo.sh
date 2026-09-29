#!/usr/bin/env bash
# Local MongoDB control script — runs mongod as your user, no sudo/systemd needed.
#
#   ./scripts/local-mongo.sh start    # start the server on 127.0.0.1:27017
#   ./scripts/local-mongo.sh stop     # graceful shutdown (flushes data)
#   ./scripts/local-mongo.sh restart
#   ./scripts/local-mongo.sh status
#   ./scripts/local-mongo.sh logs     # tail the server log
#
# Binary + data live outside the repo:
#   ~/.local/share/mongodb/bin/mongod
#   ~/.local/share/mongodb/data
set -euo pipefail

MONGO_HOME="${MONGO_HOME:-$HOME/.local/share/mongodb}"
BIN="$MONGO_HOME/bin/mongod"
DBPATH="$MONGO_HOME/data"
LOG="$MONGO_HOME/mongod.log"
PORT="${MONGO_PORT:-27017}"

running() { pgrep -f "$BIN" >/dev/null 2>&1; }

case "${1:-start}" in
  start)
    if [ ! -x "$BIN" ]; then
      echo "mongod not found at $BIN" >&2
      exit 1
    fi
    if running; then
      echo "mongod already running (port $PORT)"
      exit 0
    fi
    "$BIN" --dbpath "$DBPATH" --port "$PORT" --bind_ip 127.0.0.1 --fork --logpath "$LOG"
    echo "mongod started on mongodb://127.0.0.1:$PORT"
    ;;
  stop)
    if ! running; then
      echo "mongod is not running"
      exit 0
    fi
    "$BIN" --dbpath "$DBPATH" --shutdown >/dev/null 2>&1
    echo "mongod stopped"
    ;;
  restart)
    "$0" stop || true
    "$0" start
    ;;
  status)
    if running; then
      echo "mongod running (pid $(pgrep -f "$BIN" | head -1), port $PORT)"
    else
      echo "mongod stopped"
    fi
    ;;
  logs)
    tail -f "$LOG"
    ;;
  *)
    echo "usage: $0 {start|stop|restart|status|logs}" >&2
    exit 1
    ;;
esac
