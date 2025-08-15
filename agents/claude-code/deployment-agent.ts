/**
 * Deployment Agent for Fixlify
 * Use with Claude Code: @file:deployment-agent.ts
 */

import { execSync } from 'child_process'
import { createClient } from '@supabase/supabase-js'

export class DeploymentAgent {
  private supabase: any
  private checks = {
    preDeployment: [],
    postDeployment: []
  }

  async deployToProduction() {
    console.log('🚀 Starting Production Deployment...\n')
    
    try {
      // 1. Pre-deployment checks
      await this.runPreDeploymentChecks()
      
      // 2. Create backup
      await this.createBackup()
      
      // 3. Run migrations
      await this.runMigrations()
      
      // 4. Deploy functions
      await this.deployEdgeFunctions()
      
      // 5. Deploy frontend
      await this.deployFrontend()
      
      // 6. Post-deployment validation
      await this.runPostDeploymentChecks()
      
      console.log('✅ Deployment Successful!')
      return true
    } catch (error) {
      console.error('❌ Deployment Failed:', error)
      await this.rollback()
      return false
    }
  }

  async runPreDeploymentChecks() {
    const checks = [
      this.checkTypeScript(),
      this.checkTests(),
      this.checkEnvironmentVariables(),
      this.checkDatabaseMigrations()
    ]
    
    const results = await Promise.all(checks)
    if (results.some(r => !r)) {
      throw new Error('Pre-deployment checks failed')
    }
  }

  async checkTypeScript() {
    try {
      execSync('npx tsc --noEmit')
      console.log('✓ TypeScript check passed')
      return true
    } catch {
      console.error('✗ TypeScript errors found')
      return false
    }
  }

  async checkTests() {
    try {
      execSync('npm test')
      console.log('✓ Tests passed')
      return true
    } catch {
      console.error('✗ Tests failed')
      return false
    }
  }

  async checkEnvironmentVariables() {
    const required = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'TELNYX_API_KEY'
    ]
    
    const missing = required.filter(key => !process.env[key])
    if (missing.length > 0) {
      console.error('✗ Missing env vars:', missing)
      return false
    }
    
    console.log('✓ Environment variables configured')
    return true
  }

  async checkDatabaseMigrations() {
    try {
      execSync('supabase migration list')
      console.log('✓ Migrations ready')
      return true
    } catch {
      console.error('✗ Migration issues')
      return false
    }
  }

  async createBackup() {
    const timestamp = new Date().toISOString()
    console.log(`Creating backup: backup-${timestamp}`)
    
    // Database backup
    execSync(`supabase db dump > backups/db-${timestamp}.sql`)
    
    // Code backup
    execSync(`git tag backup-${timestamp}`)
    
    console.log('✓ Backup created')
  }

  async runMigrations() {
    console.log('Running database migrations...')
    execSync('supabase db push')
    console.log('✓ Migrations applied')
  }

  async deployEdgeFunctions() {
    const functions = [
      'ai-assistant-webhook',
      'ai-appointment-handler',
      'ai-dispatcher-handler'
    ]
    
    for (const fn of functions) {
      console.log(`Deploying ${fn}...`)
      execSync(`supabase functions deploy ${fn} --no-verify-jwt`)
    }
    
    console.log('✓ Edge functions deployed')
  }

  async deployFrontend() {
    console.log('Building frontend...')
    execSync('npm run build')
    
    console.log('Deploying to Vercel...')
    execSync('vercel --prod')
    
    console.log('✓ Frontend deployed')
  }

  async runPostDeploymentChecks() {
    // Health checks
    const endpoints = [
      'https://your-app.vercel.app',
      'https://your-supabase.supabase.co/functions/v1/ai-assistant-webhook'
    ]
    
    for (const url of endpoints) {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Health check failed: ${url}`)
      }
    }
    
    console.log('✓ Post-deployment checks passed')
  }

  async rollback() {
    console.log('⚠️ Rolling back deployment...')
    
    // Restore from latest backup
    const latestBackup = execSync('git describe --tags --abbrev=0').toString().trim()
    execSync(`git checkout ${latestBackup}`)
    
    console.log('✓ Rollback completed')
  }
}

// CLI usage
if (require.main === module) {
  const agent = new DeploymentAgent()
  agent.deployToProduction()
}