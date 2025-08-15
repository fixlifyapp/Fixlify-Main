# Production Readiness Agents

## Quick Start

### 1. Install SQL Functions
Run `production-checks.sql` in Supabase SQL editor.

### 2. Run Browser Test
Open your app, open console (F12), paste and run:
```javascript
await fetch('/agents/run-production-tests.js').then(r => r.text()).then(eval)
```

### 3. Run Full Suite
```bash
npm run test:production
```

## Available Agents

### 🔐 Security Agent
- RLS verification
- API key exposure
- Webhook security
- Auth flow validation

### 🐛 Bug Detection Agent  
- TypeScript errors
- Runtime errors
- Console.log cleanup
- Dead code detection

### 🔄 Flow Validation Agent
- Job creation flow
- AI dispatcher flow
- Payment processing
- Appointment booking

### ⚡ Performance Agent
- Page load times (<2s)
- API response times (<500ms)
- Database query optimization
- Missing indexes

### 📊 Data Integrity Agent
- Orphaned records
- Duplicate detection
- Required field validation
- Relationship integrity

## Production Checklist

✅ **Required (Blockers)**
- [ ] All tables have RLS enabled
- [ ] No TypeScript errors
- [ ] No exposed service keys
- [ ] All critical flows pass

⚠️ **Recommended**
- [ ] Page load <2 seconds
- [ ] No orphaned records
- [ ] Console.logs removed
- [ ] Error handling in place

## Usage Examples

### Run specific agent:
```javascript
const { SecurityAgent } = require('./agents/production-test-suite')
await SecurityAgent.runAll()
```

### Check single flow:
```javascript
const { FlowAgent } = require('./agents/production-test-suite')
await FlowAgent.validateFlow('aiDispatcher')
```

### Quick browser check:
```javascript
// In browser console
testProductionReadiness()
```

## Results

- **PASSED**: Ready for production
- **WARNINGS**: Should fix but not blocking
- **FAILED**: Must fix before production