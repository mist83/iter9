cd ..
cd scrapegoat
.\package.ps1
cd ..
dotnet lambda deploy-function --config-file .\.env\config.json
cd scripts
