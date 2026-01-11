# Smart Commit Command

Create a well-formatted conventional commit for staged changes.

## Instructions

1. **Analyze staged changes**:
   ```bash
   git status
   git diff --cached
   ```

2. **Determine commit type** based on changes:
   - `feat:` - New feature or functionality
   - `fix:` - Bug fix
   - `perf:` - Performance improvement
   - `refactor:` - Code restructuring (no behavior change)
   - `style:` - Formatting, whitespace (no code change)
   - `test:` - Adding or updating tests
   - `docs:` - Documentation only
   - `chore:` - Build, config, dependencies
   - `ci:` - CI/CD changes

3. **Format commit message**:
   ```
   <type>(<optional-scope>): <short description>

   <optional body - what and why>

   <optional footer - breaking changes, issue refs>
   ```

4. **Guidelines**:
   - Subject line: max 72 characters
   - Use imperative mood: "add" not "added"
   - Don't end subject with period
   - Body: explain WHAT and WHY, not HOW
   - Reference issues: "Fixes #123" or "Closes #456"

5. **Create the commit**:
   ```bash
   git commit -m "$(cat <<'EOF'
   <type>(<scope>): <description>

   <body if needed>

   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
   EOF
   )"
   ```

## Arguments

$ARGUMENTS - Optional: commit message hint or issue reference

## Examples

- `/commit` - Auto-detect type and generate message
- `/commit fix login bug` - Create fix commit with hint
- `/commit #123` - Reference issue in commit
