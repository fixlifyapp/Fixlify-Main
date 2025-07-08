@echo off
cd /d "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"

echo Checking git status...
git status --porcelain

echo.
echo Checking for recent commits (last 2 days)...
git log --oneline --since="2 days ago"

echo.
echo Checking Supabase CLI status...
supabase --version

echo.
echo Listing local migrations...
dir supabase\migrations /b /o-d

echo.
echo Done checking status.
