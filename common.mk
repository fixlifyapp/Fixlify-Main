# Common Development Makefile
# =====================================================
# Core development commands for Fixlify
# Version: 1.0.0

.PHONY: install dev dev-alt build build-dev preview clean lint type-check test
.PHONY: setup reinstall stop quality security-test test-production
.PHONY: context context-validate context-update context-report context-all
.PHONY: setup-telnyx setup-phone test-sms verify-telnyx

# =============================================================================
# 📦 INSTALLATION & SETUP
# =============================================================================

install: ## Install all dependencies
	@echo "📦 Installing dependencies..."
	npm install
	@echo "✅ Dependencies installed successfully!"

setup: install ## Complete project setup (install + db setup)
	@echo "🔧 Setting up Fixlify development environment..."
	@$(MAKE) db-start
	@$(MAKE) db-migrate
	@echo "✅ Setup complete! Run 'make dev' to start development."

clean: ## Clean node modules and build artifacts
	@echo "🧹 Cleaning project..."
	rm -rf node_modules
	rm -rf dist
	rm -rf .vite
	npm cache clean --force
	@echo "✅ Project cleaned successfully!"

reinstall: clean install ## Clean reinstall of dependencies

# =============================================================================
# 🚀 DEVELOPMENT COMMANDS
# =============================================================================

start: ## Start Fixlify (install deps if needed + run dev)
	@echo "🚀 Starting Fixlify App..."
	@echo "📍 Current directory: $$(pwd)"
	@echo ""
	@echo "📦 Installing dependencies (if needed)..."
	@npm install
	@echo ""
	@echo "🚀 Starting development server..."
	@npm run dev

dev: ## Start development server only (port 8080)
	@echo "🚀 Starting development server on port 8080..."
	npm run dev

dev-alt: ## Start development server (port 8081)
	@echo "🚀 Starting development server on port 8081..."
	npm run dev:8081

stop: ## Stop all running development servers
	@echo "🛑 Stopping development servers..."
	@pkill -f "vite" || echo "✅ No Vite servers running"
	@pkill -f "npm run dev" || echo "✅ No npm dev processes running"

build: ## Build for production
	@echo "🏗️  Building for production..."
	npm run build
	@echo "✅ Production build completed!"

build-dev: ## Build for development
	@echo "🏗️  Building for development..."
	npm run build:dev
	@echo "✅ Development build completed!"

preview: ## Preview production build locally
	@echo "👀 Previewing production build..."
	npm run preview

# =============================================================================
# 🧪 TESTING & QUALITY ASSURANCE
# =============================================================================

lint: ## Run ESLint
	@echo "🔍 Running ESLint..."
	npm run lint

lint-fix: ## Run ESLint with auto-fix
	@echo "🔧 Running ESLint with auto-fix..."
	npx eslint . --fix

type-check: ## Run TypeScript type checking
	@echo "🔍 Running TypeScript type checking..."
	npx tsc --noEmit

test: ## Run all tests
	@echo "🧪 Running all tests..."
	@echo "⚠️  Test runner not configured yet. Add your test command here."
	# npm test

test-production: ## Run production tests
	@echo "🧪 Running production tests..."
	npm run test:production

security-test: ## Run security tests
	@echo "🔒 Running security tests..."
	npm run test:security

quality: lint type-check ## Run all quality checks

# =============================================================================
# 📚 CONTEXT & DOCUMENTATION
# =============================================================================

context: ## Run context validation and update
	npm run context:all

context-validate: ## Validate context integrity
	@echo "✅ Validating context..."
	npm run context:validate

context-update: ## Update project knowledge
	@echo "📝 Updating project knowledge..."
	npm run context:update

context-report: ## Generate context report
	@echo "📊 Generating context report..."
	npm run context:report

context-all: ## Run all context operations
	@echo "📚 Running all context operations..."
	npm run context:all

# =============================================================================
# 📞 COMMUNICATION SETUP
# =============================================================================

setup-telnyx: ## Setup Telnyx integration
	@echo "📞 Setting up Telnyx integration..."
	node scripts/setup-telnyx-automated.js

setup-phone: ## Setup phone number
	@echo "📱 Setting up phone number..."
	node scripts/setup-phone-number.js

test-sms: ## Test SMS functionality
	@echo "📱 Testing SMS functionality..."
	node scripts/test_sms.js

verify-telnyx: ## Verify Telnyx configuration
	@echo "🔍 Verifying Telnyx setup..."
	node scripts/verify-telnyx-setup.js

# =============================================================================
# 🔧 UTILITIES
# =============================================================================

check-deps: ## Check for outdated dependencies
	@echo "🔍 Checking for outdated dependencies..."
	npm outdated

update-deps: ## Update dependencies
	@echo "⬆️  Updating dependencies..."
	npm update

fix-permissions: ## Fix file permissions
	@echo "🔧 Fixing file permissions..."
	chmod +x scripts/*.sh
	chmod +x scripts/*.bat

env-check: ## Check environment variables
	@echo "🔍 Checking environment variables..."
	@if [ -f .env ]; then echo "✅ .env file exists"; else echo "❌ .env file missing"; fi
	@if [ -f .env.local ]; then echo "✅ .env.local file exists"; else echo "⚠️  .env.local file missing (optional)"; fi

# =============================================================================
# 🎯 AUTOMATION WORKFLOWS
# =============================================================================

fresh-start: clean install ## Fresh start with clean install
	@$(MAKE) db-reset
	@$(MAKE) db-migrate
	@$(MAKE) dev

quick-deploy: quality build ## Quick deployment workflow

full-test: quality test-production security-test ## Run full test suite

health-check: env-check context-validate ## System health check
	@$(MAKE) db-status