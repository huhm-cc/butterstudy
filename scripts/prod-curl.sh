#!/usr/bin/env bash
set -e
BASE=http://localhost:3100
TOKEN=$(curl -s -D - -o /dev/null -X POST -H "Content-Type: application/json" \
  -d '{"email":"prod@example.com","password":"password123"}' "$BASE/api/auth/login" \
  | grep -i '^set-cookie:' | head -1 | sed -E 's/^[Ss]et-[Cc]ookie: bs_session=([^;]+);.*/\1/' | tr -d '\r')
echo "token_len=${#TOKEN}"
H="Cookie: bs_session=$TOKEN"
DOC=$(curl -s -X POST -H "Content-Type: application/json" -H "$H" \
  -d '{"title":"Curl Test","kind":"txt","content":"這個測試確認正式建置的全條流程。"}' "$BASE/api/documents")
echo "doc=$DOC"
DOCID=$(echo "$DOC" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).document.id))")
S=$(curl -s -X POST -H "Content-Type: application/json" -H "$H" -d "{\"documentId\":\"$DOCID\"}" "$BASE/api/study/sessions")
echo "session=$(echo "$S" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).session.id))")"
LIST=$(curl -s -H "$H" "$BASE/api/study/sessions")
echo "sessions=$(echo "$LIST" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).sessions.length))")"
OV=$(curl -s -H "$H" "$BASE/api/overview")
echo "overview_subjects=$(echo "$OV" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log(j.subjects.length+' tips='+j.suggestions.length)})")"
echo "stats=$(curl -s "$BASE/api/stats")"