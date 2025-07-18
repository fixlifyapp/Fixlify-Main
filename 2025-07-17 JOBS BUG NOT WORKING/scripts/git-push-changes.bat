@echo off
echo 📊 Checking Git status...
cd /d "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main"

git status

echo.
echo 📝 Ready to commit and push?
echo Press any key to continue or Ctrl+C to cancel...
pause > nul

echo.
echo ➕ Adding all changes...
git add .

echo.
echo 💬 Creating commit...
git commit -m "Add phone number management features and Telnyx sync functionality"

echo.
echo 🚀 Pushing to GitHub...
git push origin main

echo.
echo ✅ Done! All changes pushed to GitHub.
pause