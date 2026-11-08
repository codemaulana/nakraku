@echo off
echo [Nakraku] Starting FigCraft with live MCP control on port 47800...
echo [Nakraku] Keep this terminal open — closing it will kill the control port.
echo.
"C:\Program Files\FigCraft\figcraft.exe" --control 47800 "c:\Nakraku\NakrakuUI.figcraft"
echo.
echo [Nakraku] FigCraft exited. Port 47800 is now closed.
pause
