# Create Pull Request Command

Create a well-formatted pull request.

## Instructions

1. **Check current state**:
   ```bash
   git status
   git log main..HEAD --oneline
   git diff main...HEAD --stat
   ```

2. **Ensure branch is up to date**:
   ```bash
   git fetch origin main
   git rebase origin/main
   ```

3. **Run pre-PR checks**:
   ```bash
   npm run build
   npm test
   npm run lint
   ```

4. **Push branch**:
   ```bash
   git push -u origin $(git branch --show-current)
   ```

5. **Generate PR description**:
   - Analyze commits to determine changes
   - Categorize: features, fixes, refactoring
   - List affected components/files
   - Note any breaking changes

6. **Create PR**:
   ```bash
   gh pr create --title "[type]: description" --body "$(cat <<'EOF'
   ## Summary
   - Brief description of changes

   ## Changes
   - Change 1
   - Change 2

   ## Type of Change
   - [ ] Bug fix (non-breaking change fixing an issue)
   - [ ] New feature (non-breaking change adding functionality)
   - [ ] Breaking change (fix or feature causing existing functionality to change)
   - [ ] Documentation update

   ## Testing
   - [ ] Unit tests pass
   - [ ] E2E tests pass (if applicable)
   - [ ] Manual testing completed

   ## Screenshots (if applicable)
   [Add screenshots here]

   ## Checklist
   - [ ] Code follows project style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex logic
   - [ ] Documentation updated (if needed)
   - [ ] No new warnings introduced

   ---
   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   EOF
   )"
   ```

7. **Output PR URL**

## Arguments

$ARGUMENTS - Optional: PR title or description hint

## Examples

- `/create-pr` - Create PR with auto-generated description
- `/create-pr Add user authentication` - Create PR with title hint
