@echo off
rem Start a local web server for the NewDermaMed prototype and open the home page.
rem Needs Python 3 (python.org) or Node.js (nodejs.org), and an internet connection for the CDN scripts and fonts.
cd /d "%~dp0NDM"
set URL=http://localhost:8080/index.html
echo NewDermaMed prototype: %URL%  (close this window to stop)
where py >nul 2>nul && (start "" cmd /c "timeout /t 2 >nul & start %URL%" & py -m http.server 8080 & goto :eof)
where python >nul 2>nul && (start "" cmd /c "timeout /t 2 >nul & start %URL%" & python -m http.server 8080 & goto :eof)
where npx >nul 2>nul && (start "" cmd /c "timeout /t 2 >nul & start %URL%" & npx --yes http-server -p 8080 -c-1 . & goto :eof)
echo Python 3 or Node.js is needed to run a local server.
pause
