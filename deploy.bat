@echo off
REM ====================================================
REM  Stop Before You Shop - 1-Klick-Upload zu GitHub
REM  Raeumt automatisch Sperren + zu grosse Dateien auf.
REM ====================================================
cd /d "%~dp0"

echo.
echo === Aufraeumen (Sperren + zu grosse Videodatei) ===
del ".git\index.lock"  2>nul
del ".git\HEAD.lock"   2>nul
git rm --cached --ignore-unmatch "klamotten-konsum.mp4" >nul 2>nul

echo.
echo === Aenderungen werden vorbereitet... ===
git add -A
git commit -m "Update %date% %time%"
if errorlevel 1 echo --- Nichts Neues zu committen (ok) ---

echo.
echo === Wird zu GitHub gepusht... ===
git push origin main

echo.
echo ============================================================
echo  FERTIG!
echo  Warte 1-2 Minuten, dann im PRIVATEN Fenster oeffnen:
echo  https://jh100904.github.io/StopBeforeYouShop/
echo ============================================================
echo.
pause
