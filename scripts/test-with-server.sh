#!/usr/bin/env bash
#
# test-with-server.sh
#
# Ensures the Next.js dev server is running on port 3000 before executing
# the vitest integration test suite.  If a server is already listening on
# port 3000 the script leaves it alone; otherwise it starts one, waits for
# it to become ready, runs the tests, and tears the server back down.
#
# Usage:
#   bash scripts/test-with-server.sh        # run all tests
#   bash scripts/test-with-server.sh --watch # watch mode

set -euo pipefail

PORT="${TEST_PORT:-3000}"
BASE_URL="http://localhost:${PORT}"
STARTED_SERVER=false

# ── helpers ──────────────────────────────────────────────

wait_for_server() {
  local retries=0
  local max_retries=60
  while ! curl -sf -o /dev/null "${BASE_URL}/" 2>/dev/null; do
    retries=$((retries + 1))
    if [ "$retries" -ge "$max_retries" ]; then
      echo "ERROR: Dev server did not start within ${max_retries}s"
      exit 1
    fi
    sleep 1
  done
  echo "✓ Dev server ready on ${BASE_URL}"
}

port_in_use() {
  curl -sf -o /dev/null "${BASE_URL}/" 2>/dev/null
}

cleanup() {
  if [ "$STARTED_SERVER" = true ] && [ -n "${SERVER_PID:-}" ]; then
    echo ""
    echo "Stopping dev server (PID ${SERVER_PID})..."
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
    echo "✓ Dev server stopped"
  fi
}
trap cleanup EXIT

# ── main ─────────────────────────────────────────────────

if port_in_use; then
  echo "Dev server already running on ${BASE_URL}"
else
  echo "Starting dev server on port ${PORT}..."
  npx next dev -p "${PORT}" > /dev/null 2>&1 &
  SERVER_PID=$!
  STARTED_SERVER=true
  wait_for_server
fi

echo ""
echo "Running tests..."
echo "─────────────────────────────────────────────"

if [ "${1:-}" = "--watch" ]; then
  npx vitest
else
  npx vitest run
fi

TEST_EXIT=$?

echo ""
echo "─────────────────────────────────────────────"
if [ "$TEST_EXIT" -eq 0 ]; then
  echo "✓ All tests passed"
else
  echo "✗ Some tests failed (exit code ${TEST_EXIT})"
fi

exit "$TEST_EXIT"
