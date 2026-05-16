@echo off
TITLE AITeam - Cockpit de Elite
SET PORT=1327

echo 🕵️‍♂️ Magnus Mastermind: Verificando sistemas...

:: Verifica se a porta 1327 já está em uso
netstat -ano | findstr :%PORT% | findstr LISTENING > nul
if %errorlevel% == 0 (
    echo ✅ O sistema já está em operação. Abrindo o cockpit...
    start http://localhost:%PORT%
) else (
    echo 🚀 Iniciando motores na porta %PORT%...
    echo 📦 Por favor, aguarde o carregamento inicial...
    
    :: Inicia o servidor de produção em uma nova janela minimizada
    start /min cmd /c "cd /d %~dp0web && npm run start -- -p %PORT%"
    
    :: Aguarda alguns segundos para o servidor subir
    timeout /t 5 /nobreak > nul
    
    echo ✨ Cockpit pronto! Abrindo navegador...
    start http://localhost:%PORT%
)

exit
