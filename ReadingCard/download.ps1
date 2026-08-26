$baseUrl = "http://hundredname.bunbunu.com/images"
$destDir = "c:\Users\User\Desktop\Magic\cardreading\images"
for ($i=9; $i -le 20; $i++) {
    $num = "{0:D3}" -f $i
    $url = "$baseUrl/n$num.png"
    $file = "$destDir\n$num.png"
    Invoke-WebRequest -Uri $url -OutFile $file
}
Write-Host "Download complete"
