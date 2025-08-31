# Fixlify - Comprehensive Development Makefile
# =====================================================
# Elite repair shop management system development commands
# Version: 1.0.0

.PHONY: help install dev dev-alt build build-dev preview clean lint type-check test
.PHONY: db-status db-start db-stop db-reset db-migrate db-seed db-studio db-link
.PHONY: supabase-login supabase-link supabase-push supabase-pull supabase-deploy
.PHONY: context context-validate context-update context-report context-all
.PHONY: setup-telnyx setup-phone test-sms test-production security-test
.PHONY: docker-build docker-run docker-stop git-status git-push deploy
.PHONY: logs-dev logs-prod backup-db restore-db

# Default target
help: ## Show this help message
	@echo "🚀 Fixlify Development Commands"
	@echo "==============================="
	@echo ""
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""
	@echo "📋 Quick Start:"
	@echo "  make start      # One-command start (install + dev)"
	@echo "  -- OR --"
	@echo "  make install    # Install dependencies"
	@echo "  make db-start   # Start Supabase local"
	@echo "  make dev        # Start development server"
	@echo ""

# =============================================================================
# 📦 INSTALLATION & SETUP
# =============================================================================

install: ## Install all dependencies
	@echo "📦 Installing dependencies..."
	npm install
	@echo "✅ Dependencies installed successfully!"

setup: install ## Complete project setup (install + db setup)
	@echo "🔧 Setting up Fixlify development environment..."
	@make db-start
	@make db-migrate
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
# 🗄️  DATABASE & SUPABASE OPERATIONS
# =============================================================================

db-status: ## Check Supabase status
	@echo "📊 Checking Supabase status..."
	supabase status

db-start: ## Start Supabase local development
	@echo "🚀 Starting Supabase local development..."
	supabase start

db-stop: ## Stop Supabase local development
	@echo "⏹️  Stopping Supabase local development..."
	supabase stop

db-reset: ## Reset local database
	@echo "🔄 Resetting local database..."
	supabase db reset

db-migrate: ## Run database migrations
	@echo "🔄 Running database migrations..."
	supabase db push

db-seed: ## Seed database with test data
	@echo "🌱 Seeding database..."
	supabase db seed
	@echo "✅ Database seeded successfully!"

db-studio: ## Open Supabase Studio
	@echo "🎨 Opening Supabase Studio..."
	open http://localhost:54323

db-link: ## Link to remote Supabase project
	@echo "🔗 Linking to remote Supabase project..."
	supabase link --project-ref mqppvcrlvsgrsqelglod

# =============================================================================
# ☁️  SUPABASE CLOUD OPERATIONS
# =============================================================================

supabase-login: ## Login to Supabase
	@echo "🔐 Logging into Supabase..."
	supabase login

supabase-link: ## Link to Supabase project
	@echo "🔗 Linking to Supabase project..."
	supabase link --project-ref mqppvcrlvsgrsqelglod

supabase-push: ## Push local changes to remote
	@echo "⬆️  Pushing changes to Supabase..."
	supabase db push

supabase-pull: ## Pull remote changes to local
	@echo "⬇️  Pulling changes from Supabase..."
	supabase db pull

supabase-deploy: ## Deploy edge functions
	@echo "🚀 Deploying edge functions..."
	supabase functions deploy

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
# 🐳 DOCKER OPERATIONS (Future Enhancement)
# =============================================================================

docker-build: ## Build Docker image
	@echo "🐳 Building Docker image..."
	docker build -t fixlify:latest .

docker-run: ## Run Docker container
	@echo "🐳 Running Docker container..."
	docker run -p 8080:8080 fixlify:latest

docker-stop: ## Stop Docker container
	@echo "🐳 Stopping Docker containers..."
	docker stop $$(docker ps -q --filter ancestor=fixlify:latest)

# =============================================================================
# 📝 GIT OPERATIONS
# =============================================================================

git-status: ## Show git status
	@echo "📊 Git Status:"
	git status

git-push: ## Push changes to remote
	@echo "⬆️  Pushing changes to remote..."
	git add .
	git commit -m "feat: automated commit via Makefile"
	git push

git-pull: ## Pull latest changes
	@echo "⬇️  Pulling latest changes..."
	git pull

# =============================================================================
# 🚀 DEPLOYMENT
# =============================================================================

deploy: quality build ## Deploy to production (quality check + build)
	@echo "🚀 Deploying to production..."
	@echo "✅ Build completed. Deployment will be handled by Vercel on git push."
	@echo "💡 Make sure to push your changes with: make git-push"

deploy-staging: build-dev ## Deploy to staging
	@echo "🚀 Deploying to staging..."
	@echo "✅ Development build completed for staging."

# =============================================================================
# 📊 MONITORING & LOGS
# =============================================================================

logs-dev: ## View development logs
	@echo "📊 Viewing development logs..."
	@echo "💡 Check your terminal where 'make dev' is running"

logs-prod: ## View production logs (Vercel)
	@echo "📊 Production logs:"
	@echo "💡 Visit: https://vercel.com/dashboard to view production logs"

# =============================================================================
# 💾 BACKUP & RECOVERY
# =============================================================================

backup-db: ## Backup database
	@echo "💾 Creating database backup..."
	@echo "💡 Use Supabase dashboard for production backups"
	supabase db dump --file backup_$$(date +%Y%m%d_%H%M%S).sql

restore-db: ## Restore database from backup
	@echo "🔄 Database restore:"
	@echo "💡 Specify backup file: make restore-db FILE=backup.sql"
ifdef FILE
	supabase db reset
	psql -h localhost -p 54322 -U postgres -d postgres -f $(FILE)
else
	@echo "❌ Please specify backup file: make restore-db FILE=backup.sql"
endif

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

fresh-start: clean install db-reset db-migrate dev ## Complete fresh start

quick-deploy: quality build ## Quick deployment workflow

full-test: quality test-production security-test ## Run full test suite

health-check: env-check db-status context-validate ## System health check

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
	@echo "🎯 Quick Commands:"
	@echo "  make dev        # Start development"
	@echo "  make build      # Production build"
	@echo "  make quality    # Code quality checks"
	@echo "  make deploy     # Deploy to production"
	@echo ""

version: ## Show version information
	@echo "Fixlify v1.0.0 - Elite Development Environment"
	@echo "Created by: Fixlify Development Team"
	@echo "Last Updated: $$(date)"