# Fixlify Layout Patterns & Solutions

## 📱 Responsive Component Patterns

### Container Pattern
```tsx
// Always wrap page content in responsive container
<div className="container-responsive">
  {/* Page content */}
</div>
```

### Spacing Pattern
```tsx
// Use semantic spacing classes
<div className="space-mobile md:space-tablet lg:space-desktop xl:space-wide">
  {/* Content with responsive padding */}
</div>
```

### Grid Pattern
```tsx
// Responsive grid with proper gaps
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
  {/* Grid items */}
</div>
```

### Touch Target Pattern
```tsx
// Ensure proper touch targets on mobile
<Button className="min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0">
  Click Me
</Button>
```

## 🎨 Common Layout Issues & Fixes

### Issue: Content Too Wide on Desktop
```css
/* Bad */
.content {
  width: 100%;
}

/* Good */
.content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}
```

### Issue: Small Touch Targets on Mobile
```css
/* Bad */
button {
  padding: 0.5rem;
}

/* Good */
button {
  padding: 0.5rem;
  min-height: 44px;
  min-width: 44px;
}

@media (min-width: 768px) {
  button {
    min-height: auto;
    min-width: auto;
  }
}
```

### Issue: Inconsistent Spacing
```css
/* Bad - Random padding values */
.card { padding: 12px; }
.header { padding: 18px; }
.section { padding: 24px; }

/* Good - Consistent scale */
.card { @apply space-mobile; }
.header { @apply space-tablet; }
.section { @apply space-desktop; }
```

### Issue: No Mobile Sidebar Background
```tsx
/* Bad */
<Sheet>
  <SheetContent className="bg-sidebar">
    {/* Content */}
  </SheetContent>
</Sheet>

/* Good */
<Sheet>
  <SheetContent className="bg-white" style={{ backgroundColor: 'white' }}>
    {/* Content */}
  </SheetContent>
</Sheet>
```

## 🔧 Layout Testing Checklist

Before committing any layout changes:

- [ ] Test on mobile (320px, 375px, 414px)
- [ ] Test on tablet (768px, 820px, 1024px)
- [ ] Test on desktop (1280px, 1440px, 1920px)
- [ ] Test on ultra-wide (2560px, 3840px)
- [ ] Run LAYOUT_DEBUG.js to check for issues
- [ ] Verify touch targets are ≥44px on mobile
- [ ] Check content doesn't stretch on wide screens
- [ ] Ensure proper spacing scale is used
- [ ] Document changes in PROJECT_KNOWLEDGE.md

## 📐 CSS Architecture Rules

### 1. File Organization
```
src/styles/
├── index.css          # Main entry, imports
├── responsive-layout.css  # Layout system
├── components/        # Component-specific styles
└── pages/            # Page-specific styles
```

### 2. Naming Convention
```css
/* Semantic class names */
.container-responsive { }
.space-mobile { }
.grid-responsive { }

/* Component modifiers */
.card--elevated { }
.button--primary { }
.header--sticky { }
```

### 3. Specificity Rules
```css
/* Avoid !important */
❌ .class { color: red !important; }

/* Use proper specificity */
✅ .page .section .class { color: red; }

/* Or use CSS Modules/Tailwind */
✅ className="text-red-500"
```

### 4. Media Query Strategy
```css
/* Mobile First */
.element {
  /* Mobile styles (default) */
  padding: 1rem;
}

@media (min-width: 640px) {
  .element {
    /* Tablet enhancement */
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .element {
    /* Desktop enhancement */
    padding: 2rem;
  }
}
```

## 🚀 Performance Guidelines

### 1. CSS Loading
- Critical CSS inline in <head>
- Non-critical CSS lazy loaded
- Remove unused CSS with PurgeCSS

### 2. Layout Shifts
- Set explicit dimensions on images
- Reserve space for dynamic content
- Use skeleton loaders

### 3. Responsive Images
```tsx
<img 
  src="image.jpg"
  srcSet="image-mobile.jpg 640w, image-tablet.jpg 1024w, image-desktop.jpg 1920w"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  loading="lazy"
  alt="Description"
/>
```

## 📋 Quick Reference

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1023px  
- Desktop: 1024px - 1279px
- Wide: ≥ 1280px

### Spacing Scale
- Mobile: 1rem (16px)
- Tablet: 1.5rem (24px)
- Desktop: 2rem (32px)
- Wide: 2.5rem (40px)

### Container Widths
- Mobile: 100% - 2rem padding
- Tablet: 100% - 3rem padding
- Desktop: max 1200px
- Wide: max 1400px

### Z-Index Scale
- Base: 0
- Dropdown: 50
- Modal: 100
- Notification: 150
- Tooltip: 200
