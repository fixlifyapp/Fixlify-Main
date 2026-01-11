# Deploy Command

Deploy Fixlify to staging or production environment.

## Instructions

1. **Pre-deployment checks**:
   ```bash
   # Ensure clean working directory
   git status

   # Run type check
   npm run build

   # Run tests
   npm test

   # Check for lint errors
   npm run lint
   ```

2. **Determine deployment target**:
   - `staging` - Deploy to staging environment
   - `production` / `prod` - Deploy to production (requires confirmation)

3. **Deployment steps**:

   ### Staging
   ```bash
   git checkout staging
   git merge main
   git push origin staging
   ```

   ### Production
   ```bash
   # Verify staging is stable
   # Confirm with user before proceeding

   git checkout main
   git merge staging  # if coming from staging
   git push origin main
   ```

4. **Database migrations** (if any pending):
   ```bash
   supabase db push
   supabase functions deploy
   ```

5. **Post-deployment verification**:
   ```bash
   # Check deployment status
   curl -I https://fixlify.app

   # Monitor logs
   vercel logs --follow
   ```

## Arguments

$ARGUMENTS - Target environment: `staging` or `production`

## Examples

- `/deploy staging` - Deploy to staging
- `/deploy production` - Deploy to production (with confirmation)
- `/deploy` - Show deployment status and options
