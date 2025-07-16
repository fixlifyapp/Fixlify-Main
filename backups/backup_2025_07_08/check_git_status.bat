@echo off
cd /d "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"
echo === Git Status ===
git status --short
echo.
echo === Files Summary ===
echo New files:
git status --short | findstr "^??"
echo.
echo Modified files:
git status --short | findstr "^ M"
echo.
echo === Ready to push ===
