@echo off
REM ====================================================
REM  Stop Before You Shop - 1-Klick-Upload zu GitHub
REM  Einfach doppelklicken. Fertig.
REM ====================================================
cd /d "%~dp0"

echo.
echo === Aenderungen werden hochgeladen... ===
echo.

git add -A

REM Commit mit Datum+Uhrzeit als Beschreibung
git commit -m "Update %date% %time%"

if errorlevel 1 (
  echo.
  echo --- Keine neuen Aenderungen zum Hochladen gefunden. ---
)

echo.
echo === Wird zu GitHub gepusht... ===
echo.

git push origin main

echo.
echo ============================================================
echo  FERTIG!
echo  Warte 1-2 Minuten, dann oeffne im Browser:
echo  https://jh100904.github.io/StopBeforeYouShop/
echo  und druecke STRG+F5
echo ============================================================
echo.
pause
