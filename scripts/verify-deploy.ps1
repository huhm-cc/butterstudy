param([string]$Base = "https://butterstudy-five.vercel.app")
Write-Output "=== pages ==="
foreach ($path in @("/", "/login", "/register", "/stats", "/study-overview", "/study")) {
  try {
    $r = Invoke-WebRequest -Uri ($Base + $path) -UseBasicParsing -MaximumRedirection 0 -ErrorAction SilentlyContinue
    Write-Output ($path + " -> " + $r.StatusCode)
  } catch {
    Write-Output ($path + " -> " + $_.Exception.Response.StatusCode.value__)
  }
}
Write-Output "=== stats api ==="
$stats = Invoke-RestMethod -Uri ($Base + "/api/stats")
Write-Output ("views=" + $stats.views + " uses=" + $stats.uses)
Write-Output "=== auth flow ==="
$stamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$email = "u" + $stamp + "@example.com"
$reg = Invoke-RestMethod -Uri ($Base + "/api/auth/register") -Method POST -ContentType "application/json" -Body (@{ name = "verify"; email = $email; password = "password123" } | ConvertTo-Json)
Write-Output ("register_ok=" + $reg.ok)
$r = Invoke-WebRequest -Uri ($Base + "/api/auth/login") -Method POST -ContentType "application/json" -Body (@{ email = $email; password = "password123" } | ConvertTo-Json) -UseBasicParsing
$token = (($r.Headers["Set-Cookie"] -split ";")[0]) -replace "bs_session=", ""
$h = @{ Cookie = "bs_session=$token" }
$body = @{ title = "verify doc"; kind = "txt"; content = "Ebbinghaus forgetting curve: memory fades fastest right after learning, then slows. Spaced repetition schedules reviews along the curve." }
$doc = Invoke-RestMethod -Uri ($Base + "/api/documents") -Method POST -ContentType "application/json" -Body ($body | ConvertTo-Json) -Headers $h
Write-Output ("document_ok=" + ($doc.document.id.Length -gt 10))
$sbody = @{ documentId = $doc.document.id }
$s = Invoke-RestMethod -Uri ($Base + "/api/study/sessions") -Method POST -ContentType "application/json" -Body ($sbody | ConvertTo-Json) -Headers $h
Write-Output ("session_ok=" + ($s.session.id.Length -gt 10))
Write-Output "=== ai features (live NVIDIA) ==="
$obody = @{ documentId = $doc.document.id }
$outline = Invoke-RestMethod -Uri ($Base + "/api/ai/outline") -Method POST -ContentType "application/json" -Body ($obody | ConvertTo-Json) -Headers $h -TimeoutSec 100
Write-Output ("outline_ok=" + ($outline.outline.chapters.Count -gt 0) + " chapters=" + $outline.outline.chapters.Count + " keypoints=" + $outline.outline.keyPoints.Count)
$quiz = Invoke-RestMethod -Uri ($Base + "/api/ai/quiz") -Method POST -ContentType "application/json" -Body ($obody | ConvertTo-Json) -Headers $h -TimeoutSec 100
Write-Output ("quiz_ok=" + ($quiz.quiz.questions.Count -gt 0) + " questions=" + $quiz.quiz.questions.Count)
$cbody = @{ documentId = $doc.document.id; question = "What is the key point?"; history = @() }
$chat = Invoke-WebRequest -Uri ($Base + "/api/ai/chat") -Method POST -ContentType "application/json" -Body ($cbody | ConvertTo-Json) -Headers $h -TimeoutSec 100 -UseBasicParsing
$bytes = $chat.RawContentStream.ToArray()
$text = [Text.Encoding]::UTF8.GetString($bytes)
Write-Output ("chat_ok=" + ($text.Length -gt 50) + " bytes=" + $text.Length)
$stats2 = Invoke-RestMethod -Uri ($Base + "/api/stats")
Write-Output ("stats_after views=" + $stats2.views + " uses=" + $stats2.uses)