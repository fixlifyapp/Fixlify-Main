# Git Operations Makefile
# =====================================================
# Git workflow commands for version control
# Version: 1.0.0

.PHONY: git-status git-branch git-branches git-checkout git-commit git-push git-pull
.PHONY: git-log git-diff git-stash git-unstash git-fetch git-merge git-rebase
.PHONY: git-tag git-reset git-clean pr-create

# =============================================================================
# 📊 STATUS & INFORMATION
# =============================================================================

git-status: ## Show git status
	@echo "📊 Git Status:"
	@git status

git-branch: ## Show current branch
	@echo "🌿 Current branch:"
	@git branch --show-current

git-branches: ## List all branches
	@echo "📋 All branches:"
	@git branch -a

git-log: ## Show recent commits (last 10)
	@echo "📜 Recent commits:"
	@git log --oneline -10

git-log-full: ## Show detailed commit history
	@echo "📜 Detailed commit history:"
	@git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit -20

git-diff: ## Show uncommitted changes
	@echo "📝 Uncommitted changes:"
	@git diff

git-diff-staged: ## Show staged changes
	@echo "📝 Staged changes:"
	@git diff --staged

# =============================================================================
# 🌿 BRANCH OPERATIONS
# =============================================================================

git-create-branch: ## Create and switch to new branch (use BRANCH=name)
ifdef BRANCH
	@echo "🌿 Creating and switching to branch: $(BRANCH)"
	@git checkout -b $(BRANCH)
	@echo "✅ Switched to new branch: $(BRANCH)"
else
	@echo "❌ Please specify branch name: make git-create-branch BRANCH=feature/your-feature"
	@echo ""
	@echo "📋 Branch naming conventions:"
	@echo "  feature/name  - New features"
	@echo "  fix/name      - Bug fixes"
	@echo "  hotfix/name   - Urgent fixes"
	@echo "  refactor/name - Code refactoring"
	@echo "  docs/name     - Documentation"
	@echo "  test/name     - Test additions"
	@echo "  chore/name    - Maintenance tasks"
endif

git-checkout: ## Switch to existing branch (use BRANCH=name)
ifdef BRANCH
	@echo "🔄 Switching to branch: $(BRANCH)"
	@git checkout $(BRANCH)
else
	@echo "❌ Please specify branch: make git-checkout BRANCH=branch-name"
endif

git-checkout-main: ## Switch to main branch
	@echo "🔄 Switching to main branch..."
	@git checkout main

git-delete-branch: ## Delete a branch (use BRANCH=name)
ifdef BRANCH
	@echo "🗑️  Deleting branch: $(BRANCH)"
	@git branch -d $(BRANCH)
else
	@echo "❌ Please specify branch: make git-delete-branch BRANCH=branch-name"
endif

git-rename-branch: ## Rename current branch (use NAME=new-name)
ifdef NAME
	@echo "✏️  Renaming current branch to: $(NAME)"
	@git branch -m $(NAME)
else
	@echo "❌ Please specify new name: make git-rename-branch NAME=new-name"
endif

# =============================================================================
# 💾 COMMIT OPERATIONS
# =============================================================================

git-commit: ## Commit changes with message (use MSG="your message")
ifdef MSG
	@echo "💾 Committing changes..."
	@git add .
	@git commit -m "$(MSG)"
	@echo "✅ Changes committed with message: $(MSG)"
else
	@echo "❌ Please provide commit message: make git-commit MSG=\"your commit message\""
	@echo ""
	@echo "📋 Commit message conventions:"
	@echo "  feat: New feature"
	@echo "  fix: Bug fix"
	@echo "  docs: Documentation changes"
	@echo "  style: Code style changes"
	@echo "  refactor: Code refactoring"
	@echo "  test: Test additions/changes"
	@echo "  chore: Maintenance tasks"
	@echo "  perf: Performance improvements"
	@echo ""
	@echo "Example: make git-commit MSG=\"feat: add user authentication\""
endif

git-commit-amend: ## Amend last commit (use MSG="new message" optional)
ifdef MSG
	@echo "✏️  Amending last commit with new message..."
	@git commit --amend -m "$(MSG)"
else
	@echo "✏️  Amending last commit..."
	@git commit --amend
endif

git-add: ## Stage all changes
	@echo "➕ Staging all changes..."
	@git add .
	@echo "✅ All changes staged"

git-add-file: ## Stage specific file (use FILE=path/to/file)
ifdef FILE
	@echo "➕ Staging file: $(FILE)"
	@git add $(FILE)
else
	@echo "❌ Please specify file: make git-add-file FILE=path/to/file"
endif

git-unstage: ## Unstage all files
	@echo "➖ Unstaging all files..."
	@git reset HEAD
	@echo "✅ All files unstaged"

# =============================================================================
# 🔄 SYNC OPERATIONS
# =============================================================================

git-push: ## Push current branch to remote
	@echo "⬆️  Pushing current branch to remote..."
	@git push

git-push-branch: ## Push new branch to remote (sets upstream)
	@echo "⬆️  Pushing new branch and setting upstream..."
	@git push -u origin $$(git branch --show-current)

git-pull: ## Pull latest changes from remote
	@echo "⬇️  Pulling latest changes..."
	@git pull

git-fetch: ## Fetch remote changes without merging
	@echo "🔄 Fetching remote changes..."
	@git fetch --all

git-sync: ## Sync with remote (fetch + pull)
	@echo "🔄 Syncing with remote..."
	@git fetch --all
	@git pull

# =============================================================================
# 🔀 MERGE & REBASE
# =============================================================================

git-merge: ## Merge branch into current (use BRANCH=name)
ifdef BRANCH
	@echo "🔀 Merging $(BRANCH) into current branch..."
	@git merge $(BRANCH)
else
	@echo "❌ Please specify branch: make git-merge BRANCH=branch-name"
endif

git-merge-main: ## Merge main into current branch
	@echo "🔀 Merging main into current branch..."
	@git merge main

git-rebase: ## Rebase current branch (use BRANCH=name)
ifdef BRANCH
	@echo "🔄 Rebasing onto $(BRANCH)..."
	@git rebase $(BRANCH)
else
	@echo "❌ Please specify branch: make git-rebase BRANCH=branch-name"
endif

git-rebase-main: ## Rebase current branch onto main
	@echo "🔄 Rebasing onto main..."
	@git rebase main

# =============================================================================
# 📦 STASH OPERATIONS
# =============================================================================

git-stash: ## Stash current changes
	@echo "📦 Stashing changes..."
	@git stash

git-stash-save: ## Stash with message (use MSG="description")
ifdef MSG
	@echo "📦 Stashing changes with message..."
	@git stash save "$(MSG)"
else
	@echo "❌ Please provide message: make git-stash-save MSG=\"work in progress\""
endif

git-unstash: ## Apply latest stash
	@echo "📦 Applying latest stash..."
	@git stash pop

git-stash-list: ## List all stashes
	@echo "📋 Stash list:"
	@git stash list

# =============================================================================
# 🏷️ TAG OPERATIONS
# =============================================================================

git-tag: ## Create tag (use TAG=v1.0.0 MSG="Release message")
ifdef TAG
ifdef MSG
	@echo "🏷️  Creating tag: $(TAG)"
	@git tag -a $(TAG) -m "$(MSG)"
	@echo "✅ Tag created: $(TAG)"
else
	@echo "❌ Please provide message: make git-tag TAG=v1.0.0 MSG=\"Release v1.0.0\""
endif
else
	@echo "❌ Please provide tag: make git-tag TAG=v1.0.0 MSG=\"Release v1.0.0\""
endif

git-tags: ## List all tags
	@echo "🏷️  All tags:"
	@git tag -l

git-push-tags: ## Push tags to remote
	@echo "⬆️  Pushing tags to remote..."
	@git push --tags

# =============================================================================
# 🔧 UTILITIES
# =============================================================================

git-reset-soft: ## Soft reset to previous commit
	@echo "⏮️  Soft reset to previous commit..."
	@git reset --soft HEAD~1

git-reset-hard: ## Hard reset to previous commit (DANGEROUS!)
	@echo "⚠️  WARNING: This will discard all uncommitted changes!"
	@echo "Press Ctrl+C to cancel, or wait 3 seconds to continue..."
	@sleep 3
	@echo "⏮️  Hard reset to previous commit..."
	@git reset --hard HEAD~1

git-clean-branches: ## Delete merged branches
	@echo "🧹 Cleaning merged branches..."
	@git branch --merged | grep -v "\*\|main\|master\|develop" | xargs -n 1 git branch -d 2>/dev/null || echo "✅ No merged branches to clean"

git-undo: ## Undo last commit (keep changes)
	@echo "↩️  Undoing last commit (keeping changes)..."
	@git reset --soft HEAD~1
	@echo "✅ Last commit undone, changes kept in staging"

# =============================================================================
# 🚀 GITHUB OPERATIONS
# =============================================================================

pr-create: ## Create pull request (use TITLE="PR title" BODY="PR description")
ifdef TITLE
	@echo "🚀 Creating pull request..."
ifdef BODY
	@gh pr create --title "$(TITLE)" --body "$(BODY)"
else
	@gh pr create --title "$(TITLE)" --body "Auto-generated PR"
endif
else
	@echo "❌ Please provide title: make pr-create TITLE=\"feat: new feature\" BODY=\"Description\""
endif

pr-list: ## List pull requests
	@echo "📋 Pull requests:"
	@gh pr list

pr-view: ## View current branch PR
	@echo "👀 Viewing current branch PR..."
	@gh pr view

# =============================================================================
# 🎯 QUICK WORKFLOWS
# =============================================================================

git-feature: ## Create feature branch (use NAME=feature-name)
ifdef NAME
	@$(MAKE) git-create-branch BRANCH=feature/$(NAME)
else
	@echo "❌ Please provide feature name: make git-feature NAME=your-feature"
endif

git-hotfix: ## Create hotfix branch (use NAME=hotfix-name)
ifdef NAME
	@$(MAKE) git-create-branch BRANCH=hotfix/$(NAME)
else
	@echo "❌ Please provide hotfix name: make git-hotfix NAME=critical-fix"
endif

git-save: ## Quick save (add + commit with timestamp)
	@echo "💾 Quick save with timestamp..."
	@git add .
	@git commit -m "chore: quick save - $$(date '+%Y-%m-%d %H:%M:%S')"
	@echo "✅ Changes saved with timestamp"

git-wip: ## Work in progress commit
	@echo "🚧 Creating WIP commit..."
	@git add .
	@git commit -m "WIP: work in progress"
	@echo "✅ WIP commit created"

git-done: ## Finish feature and push (use MSG="commit message")
ifdef MSG
	@echo "🎯 Finishing feature..."
	@git add .
	@git commit -m "$(MSG)"
	@git push -u origin $$(git branch --show-current)
	@echo "✅ Feature completed and pushed!"
else
	@echo "❌ Please provide commit message: make git-done MSG=\"feat: completed feature\""
endif