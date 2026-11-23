#!/usr/bin/env bash
set -u
BASE="https://butterstudy-five.vercel.app"
STAMP=$(date +%s)
EMAIL="u${STAMP}@example.com"
PASS="password123"

echo "=== register ==="
REG=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"name\":\"verify\",\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" "$BASE/api/auth/register")
echo "$REG" | head -c 200; echo

echo "=== login (capture token) ==="
TOKEN=$(curl -s -D - -o /dev/null -X POST -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" "$BASE/api/auth/login" | grep -i '^set-cookie:' | head -1 | sed -E 's/^[Ss]et-[Cc]ookie: bs_session=([^;]+);.*/\1/' | tr -d '\r')
echo "token_len=${#TOKEN}"
H="Cookie: bs_session=$TOKEN"

echo "=== document + session ==="
DOC=$(curl -s -X POST -H "Content-Type: application/json" -H "$H" -d '{"title":"verify doc","kind":"txt","content":"Ebbinghaus forgetting curve: memory fades fastest right after learning, then slows. Spaced repetition schedules reviews along the curve."}' "$BASE/api/documents")
echo "$DOC" | head -c 200; echo
DOCID=$(echo "$DOC" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{console.log(JSON.parse(d).document.id)}catch(e){console.log('')}})")
S=$(curl -s -X POST -H "Content-Type: application/json" -H "$H" -d "{\"documentId\":\"$DOCID\"}" "$BASE/api/study/sessions")
echo "session=$(echo "$S" | head -c 160)"

echo "=== AI: outline (live NVIDIA) ==="
curl -s -X POST -H "Content-Type: application/json" -H "$H" -d "{\"documentId\":\"$DOCID\"}" "$BASE/api/ai/outline" --max-time 100 | head -c 600; echo

echo "=== AI: quiz (live NVIDIA) ==="
curl -s -X POST -H "Content-Type: application/json" -H "$H" -d "{\"documentId\":\"$DOCID\"}" "$BASE/api/ai/quiz" --max-time 100 | head -c 400; echo

echo "=== AI: chat stream (live NVIDIA) ==="
curl -s -N -X POST -H "Content-Type: application/json" -H "$H" -d "{\"documentId\":\"$DOCID\",\"question\":\"What is the key point?\",\"history\":[]}" "$BASE/api/ai/chat" --max-time 100 | tr '\n' ' ' | head -c 500; echo

echo "=== stats after ==="
curl -s "$BASE/api/stats"