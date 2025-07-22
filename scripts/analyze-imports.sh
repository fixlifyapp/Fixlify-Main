#!/bin/bash
# Safe optimization script for Phase 1
# This script finds and reports mixed imports without making changes

echo "=== Fixlify Code Optimization Analysis ==="
echo "Phase 1: Finding Mixed Import Patterns"
echo "========================================"

# Function to find dynamic imports
find_dynamic_imports() {
    echo -e "\n🔍 Searching for dynamic imports..."
    
    # Find files with potential dynamic imports
    echo -e "\n📁 Files with 'import(' pattern:"
    grep -r "import(" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | head -20
    
    echo -e "\n📁 Files with '.then(module' pattern:"
    grep -r "\.then(module" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | head -20
}

# Function to analyze sonner imports
analyze_sonner_imports() {
    echo -e "\n🔍 Analyzing Sonner imports..."
    
    echo -e "\n📁 Static imports of sonner:"
    grep -r "from ['\"]sonner['\"]" src/ --include="*.ts" --include="*.tsx" | head -10
    
    echo -e "\n📁 References to toast:"
    grep -r "toast\." src/ --include="*.ts" --include="*.tsx" | wc -l
    echo "Total toast references found"
}

# Function to analyze supabase imports
analyze_supabase_imports() {
    echo -e "\n🔍 Analyzing Supabase client imports..."
    
    echo -e "\n📁 Static imports of supabase client:"
    grep -r "from ['\"].*supabase/client['\"]" src/ --include="*.ts" --include="*.tsx" | wc -l
    echo "Total static imports found"
    
    echo -e "\n📁 Dynamic imports of supabase client:"
    grep -r "import(['\"].*supabase/client['\"])" src/ --include="*.ts" --include="*.tsx" | head -5
}

# Function to analyze bundle size
analyze_bundle_size() {
    echo -e "\n📊 Current Bundle Analysis:"
    
    if [ -d "dist" ]; then
        echo "Production build found. Analyzing..."
        find dist -name "*.js" -type f -exec du -h {} \; | sort -hr | head -10
    else
        echo "No dist folder found. Run 'npm run build' first."
    fi
}

# Run all analyses
find_dynamic_imports
analyze_sonner_imports
analyze_supabase_imports
analyze_bundle_size

echo -e "\n✅ Analysis complete! Review the results above."
echo "📝 Next steps:"
echo "1. Review mixed import patterns"
echo "2. Create a backup branch: git checkout -b optimization-backup"
echo "3. Fix imports one by one"
echo "4. Test after each change"
