@echo off
echo Creating full backup for 2025-07-16...

set BACKUP_DIR=C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main\backups\2025-07-16

echo Backing up source files...
xcopy "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main\src" "%BACKUP_DIR%\src" /E /Y /I /Q
xcopy "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main\supabase" "%BACKUP_DIR%\supabase" /E /Y /I /Q
xcopy "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main\public" "%BACKUP_DIR%\public" /E /Y /I /Q

echo Backing up configuration files...
copy "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main\package.json" "%BACKUP_DIR%\" /Y
copy "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main\vite.config.ts" "%BACKUP_DIR%\" /Y
copy "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main\tsconfig.json" "%BACKUP_DIR%\" /Y
copy "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main\.env.example" "%BACKUP_DIR%\" /Y 2>nul
copy "C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main\FIXLIFY_PROJECT_KNOWLEDGE.md" "%BACKUP_DIR%\" /Y

echo Backup completed!
echo Location: %BACKUP_DIR%
pause