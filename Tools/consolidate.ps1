$scriptBlock = {
    $directory = "D:\git\ClassLibrary1\ImageFiber\Resources\HTML\samples\iter9\scripts\"
    $fileList = Get-ChildItem -Path $directory -File | Where-Object { $_.Extension -eq ".js" }
    $scriptTags = @()
    foreach ($file in $fileList) {
        $fileName = $file.Name
        $scriptTag = "<script src=`"scripts/$fileName`"></script>"
        $scriptTags += $scriptTag
    }
    $scriptTagsString = $scriptTags -join "`n"
    $scriptTagsString | Out-File -FilePath "$directory\functions.txt"
}

& $scriptBlock
