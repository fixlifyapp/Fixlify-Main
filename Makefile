# Fixlify - Main Makefile Orchestrator
# =====================================================
# Elite repair shop management system development commands
# Version: 2.0.0 - Modular Architecture
#
# This Makefile includes:
#   - common.mk: Core development commands
#   - supabase.mk: Database and Supabase operations
#
# To add more modules, create a new .mk file and include it below

# Include modular makefiles
include common.mk
include supabase.mk

# Optional: Include additional modules if they exist
-include docker.mk
-include git.mk
-include deploy.mk

.PHONY: help info version

# Default target - must be first
help: ## Show this help message
	@echo "🚀 Fixlify Development Commands"
	@echo "==============================="
	@echo ""
	@echo "📋 Quick Start:"
	@echo "  make start      # One-command start (install + dev)"
	@echo "  -- OR --"
	@echo "  make install    # Install dependencies"
	@echo "  make db-start   # Start Supabase local"
	@echo "  make dev        # Start development server"
	@echo ""
	@echo "📚 Available Commands:"
	@echo ""
	@echo "▶️  Common Development (from common.mk):"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 }' common.mk | head -20
	@echo ""
	@echo "🗄️  Supabase & Database (from supabase.mk):"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 }' supabase.mk | head -20
	@echo ""
	@echo "💡 For complete list of commands in each module:"
	@echo "  make help-common    # Show all common commands"
	@echo "  make help-supabase  # Show all Supabase commands"
	@echo "  make help-all       # Show ALL available commands"
	@echo ""

# Show all commands from common.mk
help-common: ## Show all common development commands
	@echo "📚 Common Development Commands (common.mk):"
	@echo "==========================================="
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 }' common.mk

# Show all commands from supabase.mk
help-supabase: ## Show all Supabase commands
	@echo "🗄️  Supabase Commands (supabase.mk):"
	@echo "====================================="
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 }' supabase.mk

# Show ALL available commands
help-all: ## Show ALL available commands
	@echo "🚀 ALL Fixlify Development Commands"
	@echo "===================================="
	@echo ""
	@echo "📚 Common Development Commands:"
	@echo "-------------------------------"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 }' common.mk
	@echo ""
	@echo "🗄️  Supabase & Database Commands:"
	@echo "---------------------------------"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 }' supabase.mk
	@echo ""
	@if [ -f docker.mk ]; then \
		echo "🐳 Docker Commands:"; \
		echo "------------------"; \
		awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 }' docker.mk; \
		echo ""; \
	fi
	@if [ -f git.mk ]; then \
		echo "📝 Git Commands:"; \
		echo "----------------"; \
		awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 }' git.mk; \
		echo ""; \
	fi
	@if [ -f deploy.mk ]; then \
		echo "🚀 Deployment Commands:"; \
		echo "-----------------------"; \
		awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 }' deploy.mk; \
		echo ""; \
	fi

# =============================================================================
# 📋 PROJECT INFO
# =============================================================================

info: ## Show project information
	@echo "🚀 Fixlify - Elite Repair Shop Management System"
	@echo "================================================"
	@echo "📊 Project Status:"
	@echo "  - Node.js: $$(node --version)"
	@echo "  - NPM: $$(npm --version)"
	@echo "  - TypeScript: $$(npx tsc --version)"
	@echo ""
	@echo "🗄️  Database:"
	@echo "  - Supabase: Local development ready"
	@echo "  - PostgreSQL: Version 15"
	@echo ""
	@echo "🛠️  Technology Stack:"
	@echo "  - Frontend: React 18 + TypeScript + Vite"
	@echo "  - UI: shadcn/ui + Tailwind CSS"
	@echo "  - Backend: Supabase (PostgreSQL + Edge Functions)"
	@echo "  - Communication: Telnyx SMS + Mailgun Email"
	@echo ""
	@echo "📁 Makefile Structure:"
	@echo "  - Makefile: Main orchestrator"
	@echo "  - common.mk: Development commands"
	@echo "  - supabase.mk: Database operations"
	@if [ -f docker.mk ]; then echo "  - docker.mk: Docker operations"; fi
	@if [ -f git.mk ]; then echo "  - git.mk: Git operations"; fi
	@if [ -f deploy.mk ]; then echo "  - deploy.mk: Deployment commands"; fi
	@echo ""
	@echo "🎯 Quick Commands:"
	@echo "  make dev        # Start development"
	@echo "  make build      # Production build"
	@echo "  make quality    # Code quality checks"
	@echo "  make db-start   # Start Supabase"
	@echo ""

version: ## Show version information
	@echo "Fixlify v2.0.0 - Modular Makefile Architecture"
	@echo "Created by: Fixlify Development Team"
	@echo "Last Updated: $$(date)"
	@echo ""
	@echo "Makefile Modules:"
	@echo "  - common.mk v1.0.0"
	@echo "  - supabase.mk v1.0.0"

# =============================================================================
# 🚀 CONVENIENT ALIASES & WORKFLOWS
# =============================================================================

# These are high-level workflows that combine commands from multiple modules

# Complete development setup
init: install db-start db-migrate ## Initialize complete development environment
	@echo "✅ Fixlify development environment ready!"
	@echo "Run 'make dev' to start the development server"

# Deploy everything
deploy-all: quality build supabase-full-deploy ## Complete deployment (quality + build + deploy)
	@echo "✅ Full deployment completed!"

# Complete system check
check-all: health-check db-status supabase-logs ## Complete system health check
	@echo "✅ System check completed!"

# Database refresh with fresh data
db-refresh: db-fresh db-studio ## Refresh database and open studio
	@echo "✅ Database refreshed and studio opened!"

# Quick restart
restart: stop dev ## Stop and restart development server

# =============================================================================
# 🐳 DOCKER OPERATIONS (if docker.mk exists)
# =============================================================================

# Docker commands will be included automatically if docker.mk exists

# =============================================================================
# 📝 GIT OPERATIONS (if git.mk exists)
# =============================================================================

# Git commands will be included automatically if git.mk exists

# =============================================================================
# 🚀 DEPLOYMENT (if deploy.mk exists)
# =============================================================================

# Deployment commands will be included automatically if deploy.mk exists