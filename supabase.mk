# Supabase-specific Makefile
# =====================================================
# All Supabase and database-related commands
# Version: 1.0.0

.PHONY: db-status db-start db-stop db-reset db-migrate db-seed db-studio db-link
.PHONY: supabase-login supabase-link supabase-push supabase-pull supabase-deploy
.PHONY: supabase-functions supabase-secrets supabase-logs backup-db restore-db

# =============================================================================
# 🗄️  LOCAL DATABASE OPERATIONS
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
# 🔧 EDGE FUNCTIONS OPERATIONS
# =============================================================================

supabase-functions: ## List all edge functions
	@echo "📋 Listing edge functions..."
	supabase functions list

functions-serve: ## Serve edge functions locally
	@echo "🔧 Serving edge functions locally..."
	supabase functions serve

functions-deploy: ## Deploy specific function (use FUNCTION=name)
ifdef FUNCTION
	@echo "🚀 Deploying function: $(FUNCTION)..."
	supabase functions deploy $(FUNCTION)
else
	@echo "❌ Please specify function: make functions-deploy FUNCTION=function-name"
endif

# =============================================================================
# 🔐 SECRETS MANAGEMENT
# =============================================================================

supabase-secrets: ## List all secrets
	@echo "🔐 Listing secrets..."
	supabase secrets list

secrets-set: ## Set a secret (use KEY=name VALUE=value)
ifdef KEY
ifdef VALUE
	@echo "🔐 Setting secret: $(KEY)..."
	supabase secrets set $(KEY)=$(VALUE)
else
	@echo "❌ Please provide VALUE: make secrets-set KEY=name VALUE=value"
endif
else
	@echo "❌ Please provide KEY and VALUE: make secrets-set KEY=name VALUE=value"
endif

secrets-unset: ## Remove a secret (use KEY=name)
ifdef KEY
	@echo "🗑️  Removing secret: $(KEY)..."
	supabase secrets unset $(KEY)
else
	@echo "❌ Please specify KEY: make secrets-unset KEY=name"
endif

# =============================================================================
# 📊 LOGS & MONITORING
# =============================================================================

supabase-logs: ## View Supabase logs
	@echo "📊 Viewing Supabase logs..."
	supabase logs

logs-functions: ## View edge functions logs
	@echo "📊 Viewing edge functions logs..."
	supabase functions logs

logs-db: ## View database logs
	@echo "📊 Viewing database logs..."
	supabase db logs

# =============================================================================
# 💾 BACKUP & RECOVERY
# =============================================================================

backup-db: ## Backup database
	@echo "💾 Creating database backup..."
	@echo "💡 Use Supabase dashboard for production backups"
	supabase db dump --file backup_$$(date +%Y%m%d_%H%M%S).sql

restore-db: ## Restore database from backup (use FILE=backup.sql)
	@echo "🔄 Database restore:"
	@echo "💡 Specify backup file: make restore-db FILE=backup.sql"
ifdef FILE
	supabase db reset
	psql -h localhost -p 54322 -U postgres -d postgres -f $(FILE)
else
	@echo "❌ Please specify backup file: make restore-db FILE=backup.sql"
endif

# =============================================================================
# 🧪 DATABASE TESTING
# =============================================================================

db-test: ## Run database tests
	@echo "🧪 Running database tests..."
	@echo "⚠️  Database tests not configured yet."

db-diff: ## Show database schema diff
	@echo "📊 Showing database schema differences..."
	supabase db diff

db-lint: ## Lint database migrations
	@echo "🔍 Linting database migrations..."
	supabase db lint

# =============================================================================
# 🚀 QUICK WORKFLOWS
# =============================================================================

db-fresh: db-reset db-migrate db-seed ## Fresh database (reset + migrate + seed)

supabase-sync: supabase-pull supabase-push ## Sync with remote (pull + push)

supabase-full-deploy: supabase-push supabase-deploy ## Full deployment (db + functions)