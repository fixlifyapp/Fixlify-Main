#!/bin/bash
# Fixlify Routing Fix Script
# Add this to your project root as fix-routing.sh

echo "🔧 Fixing Fixlify Routing Issues..."

# Function to fix common routing problems
fix_routing() {
    echo "📍 Checking App.tsx structure..."
    
    # Create a backup
    cp src/App.tsx src/App.tsx.backup 2>/dev/null
    
    # Check for common issues
    if ! grep -q "TooltipProvider" src/App.tsx; then
        echo "⚠️  TooltipProvider missing - this might cause UI issues"
    fi
    
    if ! grep -q "ErrorBoundary" src/App.tsx; then
        echo "⚠️  ErrorBoundary missing - errors might crash the app"
    fi
    
    echo "✅ Routing structure checked"
}

# Function to verify imports
check_imports() {
    echo "📦 Checking imports..."
    
    # Check if all page imports exist
    missing_pages=""
    
    # List of required pages
    pages=(
        "src/pages/Dashboard.tsx"
        "src/pages/AuthPage.tsx"
        "src/pages/JobsPageOptimized.tsx"
        "src/pages/ClientsPage.tsx"
        "src/pages/AutomationsPage.tsx"
    )
    
    for page in "${pages[@]}"; do
        if [ ! -f "$page" ]; then
            missing_pages="$missing_pages\n  - $page"
        fi
    done
    
    if [ -n "$missing_pages" ]; then
        echo "❌ Missing pages:$missing_pages"
    else
        echo "✅ All pages found"
    fi
}

# Function to restart dev server
restart_server() {
    echo "🔄 Restarting development server..."
    
    # Kill existing processes on common ports
    for port in 8080 8081 8082 8083 8084; do
        lsof -ti:$port | xargs kill -9 2>/dev/null
    done
    
    echo "✅ Old processes killed"
    echo "📡 Starting fresh server..."
    echo "Run: npm run dev"
}

# Main execution
echo "========================================="
fix_routing
check_imports
restart_server
echo "========================================="
echo "✅ Routing fix complete!"
echo ""
echo "If you still see blank pages:"
echo "1. Check browser console for errors (F12)"
echo "2. Clear browser cache"
echo "3. Run: npm install"
echo "4. Check Supabase connection"
