# Fix GitHub Issue Command

Analyze and fix a GitHub issue systematically.

## Instructions

1. **Fetch issue details**:
   ```bash
   gh issue view $ARGUMENTS
   ```

2. **Analyze the issue**:
   - Understand the problem description
   - Identify reproduction steps
   - Note expected vs actual behavior
   - Check labels and priority

3. **Create fix branch**:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b fix/issue-$ARGUMENTS-brief-description
   ```

4. **Investigate codebase**:
   - Search for related code
   - Identify root cause
   - Plan minimal fix

5. **Implement fix**:
   - Write failing test first (if applicable)
   - Implement minimal fix
   - Ensure tests pass
   - Run type check and lint

6. **Verify fix**:
   ```bash
   npm run build
   npm test
   ```

7. **Create commit**:
   ```bash
   git add -A
   git commit -m "$(cat <<'EOF'
   fix: [description]

   Fixes #$ARGUMENTS

   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
   EOF
   )"
   ```

8. **Create PR**:
   ```bash
   git push -u origin fix/issue-$ARGUMENTS-brief-description
   gh pr create --title "Fix: [issue title]" --body "Fixes #$ARGUMENTS"
   ```

## Arguments

$ARGUMENTS - GitHub issue number (required)

## Examples

- `/fix-issue 123` - Fix issue #123
- `/fix-issue 456` - Fix issue #456
