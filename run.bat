@echo off
cd /d "%~dp0"
echo Starting Cooperative Service Marketplace Worker App...
echo Open http://localhost:8000/index.html in your browser.
python -m http.server 8000
pause
