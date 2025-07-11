# Fixlify Project - Routing & Blank Page Prevention Guide

## Quick Fix Commands

### Windows:
```batch
# Run this when you get blank pages:
fix-routing.bat
```

### Mac/Linux:
```bash
# Run this when you get blank pages:
./fix-routing.sh
```

## Common Causes of Blank Pages

1. **Syntax Errors in JSX**
   - Extra quotes/semicolons in imports
   - Missing closing tags (especially ErrorBoundary)
   - Incorrect Routes indentation

2. **Missing Providers**
   - TooltipProvider not wrapping the app
   - AuthProvider missing on protected routes

3. **Import Errors**
   - Missing icon imports (like Lightning from lucide-react)
   - Circular dependencies

4. **Port Conflicts**
   - Multiple dev servers running
   - Ports 8080-8084 blocked

## Prevention Checklist

### Before Each Commit:
- [ ] Run `npm run lint` to catch syntax errors
- [ ] Check browser console for errors (F12)
- [ ] Verify all imports are correct
- [ ] Ensure ErrorBoundary wraps the entire app

### App.tsx Structure Must Be:
```tsx
<ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* routes here */}
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
</ErrorBoundary>
```

## Debug Steps

1. **Check Console** (F12 in browser)
   - Look for red errors
   - Check network tab for failed requests

2. **Verify Route**
   - Add `/test` to URL - should show green test page
   - If test page works, issue is with specific route

3. **Clear Everything**
   ```batch
   rmdir /s /q node_modules\.vite
   npm run dev
   ```

4. **Check Supabase**
   - Verify .env.local has correct keys
   - Check Supabase dashboard for issues

## Emergency Fixes

### Fix All Syntax Errors:
```bash
# Auto-fix what's possible
npm run lint -- --fix
```

### Reset Development Environment:
```batch
# Windows
taskkill /F /IM node.exe
rmdir /s /q node_modules\.vite
npm run dev
```

### Force Rebuild:
```batch
npm run build
npm run preview
```

## Add to package.json scripts:
```json
{
  "scripts": {
    "fix": "fix-routing.bat",
    "clean": "rimraf node_modules/.vite",
    "fresh": "npm run clean && npm run dev"
  }
}
```

## VS Code Settings (add to .vscode/settings.json):
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## Monitoring Commands:

### Check what's running on ports:
```batch
netstat -ano | findstr :808
```

### Kill specific port:
```batch
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8083') do taskkill /F /PID %%a
```

## If Nothing Works:

1. **Full Reset**:
   ```batch
   rmdir /s /q node_modules
   del package-lock.json
   npm install
   npm run dev
   ```

2. **Check Git Status**:
   ```bash
   git status
   git diff
   ```

3. **Revert to Last Working**:
   ```bash
   git stash
   git checkout .
   ```

Remember: The app should ALWAYS show something, even if it's an error page. 
Complete blank = routing/provider issue.
