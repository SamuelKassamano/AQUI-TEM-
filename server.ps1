$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8080/")
$listener.Start()
Write-Host "Servidor AQUI TEM iniciado em http://localhost:8080/"

$folder = "C:\Users\SAMUEL AC\.gemini\antigravity\scratch\loja-online"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/") { $urlPath = "/index.html" }
        
        $localPath = Join-Path $folder ($urlPath.TrimStart('/').Replace('/', '\'))

        if (Test-Path $localPath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            $response.ContentLength64 = $bytes.Length
            
            if ($localPath.EndsWith(".html")) {
                $response.ContentType = "text/html; charset=utf-8"
            } elseif ($localPath.EndsWith(".css")) {
                $response.ContentType = "text/css"
            } elseif ($localPath.EndsWith(".js")) {
                $response.ContentType = "application/javascript"
            }
            
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 - Not Found")
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        $response.Close()
    }
} finally {
    $listener.Stop()
}
