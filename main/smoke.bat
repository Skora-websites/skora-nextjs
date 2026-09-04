@echo off
echo session_get=
curl -s -o nul -w "%%{http_code}\n" http://localhost:3030/api/auth/session
echo nextauth_get=
curl -s -o nul -w "%%{http_code}\n" -L --max-redirs 0 http://localhost:3030/api/auth/signin
echo forgot=
curl -s -o nul -w "%%{http_code}\n" -X POST -H "Content-Type: application/json" -d "{\"action\":\"reset-password\",\"email\":\"x@y.z\"}" http://localhost:3030/api/hrm/v2/auth
echo login=
curl -s -o nul -w "%%{http_code}\n" -X POST -H "Content-Type: application/json" -d "{\"email\":\"a@b.c\",\"password\":\"bad\"}" http://localhost:3030/api/auth/login
echo register=
curl -s -o nul -w "%%{http_code}\n" -X POST -H "Content-Type: application/json" -d "{\"name\":\"x\",\"email\":\"a@b.c\",\"password\":\"bad\"}" http://localhost:3030/api/auth/register
