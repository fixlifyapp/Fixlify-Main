# Release Command

Create a new version release with changelog.

## Instructions

1. **Check current version**:
   ```bash
   cat package.json | grep '"version"'
   git tag --list | tail -5
   ```

2. **Determine version bump**:
   - `major` (X.0.0) - Breaking changes
   - `minor` (0.X.0) - New features, backwards compatible
   - `patch` (0.0.X) - Bug fixes, backwards compatible

3. **Gather changes since last release**:
   ```bash
   # Get last tag
   LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

   # List commits since last tag
   if [ -n "$LAST_TAG" ]; then
     git log $LAST_TAG..HEAD --oneline
   else
     git log --oneline -20
   fi
   ```

4. **Generate changelog entry**:
   ```markdown
   ## [X.X.X] - YYYY-MM-DD

   ### Added
   - New feature 1
   - New feature 2

   ### Changed
   - Changed behavior 1

   ### Fixed
   - Bug fix 1
   - Bug fix 2

   ### Security
   - Security fix 1
   ```

5. **Update version**:
   ```bash
   npm version $ARGUMENTS --no-git-tag-version
   ```

6. **Commit release**:
   ```bash
   git add package.json package-lock.json CHANGELOG.md
   git commit -m "$(cat <<'EOF'
   chore(release): vX.X.X

   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
   EOF
   )"
   ```

7. **Create tag**:
   ```bash
   git tag -a vX.X.X -m "Release vX.X.X"
   ```

8. **Push**:
   ```bash
   git push origin main --tags
   ```

9. **Create GitHub release**:
   ```bash
   gh release create vX.X.X --title "vX.X.X" --notes-file RELEASE_NOTES.md
   ```

## Arguments

$ARGUMENTS - Version bump type: `major`, `minor`, or `patch`

## Examples

- `/release patch` - Bug fix release (0.0.X)
- `/release minor` - Feature release (0.X.0)
- `/release major` - Breaking change release (X.0.0)
