$sess = $null
$a = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"t4@example.com","password":"password123"}' -SessionVariable sess
Write-Output ("login_ok=" + $a.ok + " name=" + $a.user.name)
$b = Invoke-RestMethod -Uri "http://localhost:3000/api/me" -WebSession $sess
Write-Output ("me=" + $b.user.name)
$c = Invoke-RestMethod -Uri "http://localhost:3000/api/documents" -Method POST -ContentType "application/json" -Body '{"title":"Test Doc","kind":"txt","content":"hello world content"}' -WebSession $sess
Write-Output ("doc=" + $c.document.id)
$body = "{`"documentId`":`"" + $c.document.id + "`"}"
$d = Invoke-RestMethod -Uri "http://localhost:3000/api/study/sessions" -Method POST -ContentType "application/json" -Body $body -WebSession $sess
Write-Output ("session=" + $d.session.id)
$e = Invoke-RestMethod -Uri "http://localhost:3000/api/study/sessions" -WebSession $sess
Write-Output ("sessions=" + $e.sessions.Count)
$o = Invoke-RestMethod -Uri "http://localhost:3000/api/overview" -WebSession $sess
Write-Output ("overview done=" + $o.completedLessons + " subjects=" + $o.subjects.Count + " tips=" + $o.suggestions.Count)