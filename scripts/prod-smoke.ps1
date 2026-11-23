$base = "http://localhost:3100"
# 生產模式 cookie 帶 Secure,http 本機測試需手動從 Set-Cookie 取 token 带上
$r = Invoke-WebRequest -Uri "$base/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"prod@example.com","password":"password123"}' -UseBasicParsing
$setCookie = $r.Headers["Set-Cookie"]
$token = ($setCookie -split ";")[0] -replace "bs_session=", ""
$h = @{ Cookie = "bs_session=$token" }
Write-Output ("login=" + $r.StatusCode + " token_len=" + $token.Length)
$doc = Invoke-RestMethod -Uri "$base/api/documents" -Method POST -ContentType "application/json" -Body '{"title":"Prod Test","kind":"txt","content":"這個測試確認正式建置的全條流程。"}' -Headers $h
Write-Output ("doc_ok=" + ($doc.document.id.Length -gt 10))
$s = Invoke-RestMethod -Uri "$base/api/study/sessions" -Method POST -ContentType "application/json" -Body ("{`"documentId`":`"" + $doc.document.id + "`"}") -Headers $h
Write-Output ("session_ok=" + ($s.session.id.Length -gt 10))
$list = Invoke-RestMethod -Uri "$base/api/study/sessions" -Headers $h
Write-Output ("sessions=" + $list.sessions.Count)
$o = Invoke-RestMethod -Uri "$base/api/overview" -Headers $h
Write-Output ("overview_subjects=" + $o.subjects.Count + " tips=" + $o.suggestions.Count)
$st = Invoke-RestMethod -Uri "$base/api/stats"
Write-Output ("stats_views=" + $st.views + " uses=" + $st.uses)