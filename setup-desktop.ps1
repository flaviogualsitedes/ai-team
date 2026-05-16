$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), "AITeam Cockpit.lnk")
$Shortcut = $WshShell.CreateShortcut($DesktopPath)

# Define o caminho para o script de inicialização
$Shortcut.TargetPath = "d:\projetos\ai-team\start-aiteam.bat"
$Shortcut.WorkingDirectory = "d:\projetos\ai-team"
$Shortcut.Description = "Iniciar o Cockpit de Elite do AITeam"

# Salva o atalho
$Shortcut.Save()

Write-Host "🚀 Magnus Mastermind: Atalho 'AITeam Cockpit' criado no seu Desktop com sucesso!" -ForegroundColor Cyan
