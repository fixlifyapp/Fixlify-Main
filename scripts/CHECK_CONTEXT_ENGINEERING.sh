# Context Engineering Check Script
# This runs when user says "check context engineering"

echo "🔍 Checking Fixlify Context Engineering..."
echo "==========================================="

# Function to check file
check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1 - Found"
        echo "   Last modified: $(date -r "$1" "+%Y-%m-%d %H:%M")"
        echo "   Size: $(wc -l < "$1") lines"
    else
        echo "❌ $1 - Not found"
    fi
}

# Core context files
echo -e "\n📋 Core Context Files:"
check_file "FIXLIFY_PROJECT_KNOWLEDGE.md"
check_file "FIXLIFY_CONTEXT.md"
check_file "FIXLIFY_PATTERNS.md"
check_file "FIXLIFY_COMMON_FIXES.md"

# New context files
echo -e "\n📋 Extended Context Files:"
check_file "FIXLIFY_LAYOUT_PATTERNS.md"
check_file "CONTEXT_ENGINEERING_GUIDE.md"
check_file "FIXLIFY_QUICK_REFERENCE.md"
check_file "FIXLIFY_RULES.md"

# Additional context files
echo -e "\n📋 Additional Context Files:"
for file in FIXLIFY_*.md; do
    if [[ ! "$file" =~ (PROJECT_KNOWLEDGE|CONTEXT|PATTERNS|COMMON_FIXES|LAYOUT_PATTERNS|QUICK_REFERENCE|RULES) ]]; then
        if [ -f "$file" ]; then
            check_file "$file"
        fi
    fi
done

# Analysis reports
echo -e "\n📊 Analysis & Debug Files:"
check_file "LAYOUT_ANALYSIS_REPORT.md"
check_file "LAYOUT_DEBUG.js"

# Check for outdated information
echo -e "\n⚠️  Files Not Updated Recently (>7 days):"
find . -name "FIXLIFY_*.md" -mtime +7 -exec echo "   - {}" \;

# Summary
echo -e "\n📈 Context Health Summary:"
total_files=$(ls FIXLIFY_*.md 2>/dev/null | wc -l)
echo "   Total context files: $total_files"
echo "   Total lines: $(cat FIXLIFY_*.md 2>/dev/null | wc -l)"

echo -e "\n✅ Context engineering check complete!"
