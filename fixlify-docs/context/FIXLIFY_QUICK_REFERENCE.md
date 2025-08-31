# 🚀 FIXLIFY QUICK REFERENCE

## 📋 Context Files Overview
1. **FIXLIFY_PROJECT_KNOWLEDGE.md** - Technical docs & fixes
2. **FIXLIFY_CONTEXT.md** - Dev rules & guidelines  
3. **FIXLIFY_PATTERNS.md** - Code patterns
4. **FIXLIFY_COMMON_FIXES.md** - Quick solutions
5. **FIXLIFY_LAYOUT_PATTERNS.md** - Layout patterns (NEW)

## 🎯 When Working on Fixlify

### Before Starting
```bash
# 1. Pull latest
git pull origin main

# 2. Check context
cat FIXLIFY_CONTEXT.md

# 3. Start dev server
npm run dev
```

### During Development
```bash
# Test layout issues
# Copy LAYOUT_DEBUG.js to browser console

# Check responsive design
# Use DevTools device emulation

# Update context after fixes
echo "## Fix Name" >> FIXLIFY_PROJECT_KNOWLEDGE.md
```

### Before Committing
- [ ] Test all device sizes
- [ ] Run layout debug script
- [ ] Update PROJECT_KNOWLEDGE.md
- [ ] Check no duplicate files created
- [ ] Verify no !important overuse

## 🔧 Common Commands

### Layout Testing
```javascript
// In browser console
copy(await fetch('/LAYOUT_DEBUG.js').then(r => r.text()))
// Then paste and run
```

### Find Issues
```bash
# Search for !important
grep -r "!important" src/styles/

# Find large files
find src -name "*.css" -size +100k

# Check for conflicts
grep -r "layout-fix" src/
```

## 📐 Key Measurements

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640-1023px
- **Desktop**: 1024-1279px
- **Wide**: ≥ 1280px

### Spacing
- **Mobile**: 1rem
- **Tablet**: 1.5rem
- **Desktop**: 2rem
- **Wide**: 2.5rem

### Containers
- **Desktop**: max 1200px
- **Wide**: max 1400px

### Touch Targets
- **Mobile**: min 44px × 44px

## 🚨 Red Flags

1. **CSS with 50+ !important** → Refactor
2. **No max-width on desktop** → Add container
3. **< 16px padding mobile** → Too tight
4. **Multiple CSS same issue** → Consolidate
5. **No responsive testing** → Test all sizes

## 💡 Pro Tips

1. **Mobile First**: Start small, enhance up
2. **Use DevTools**: Responsive mode is your friend
3. **Document Fast**: Update context immediately
4. **One Fix One File**: Don't scatter solutions
5. **Test Touch**: Use actual device when possible

---
*Keep this handy while developing!*
