# Fixlify Credit System - Business Model Plan

> **Status:** DRAFT - Ready for Review
> **Last Updated:** January 2026
> **Version:** 1.0

---

## Executive Summary

Переход на модель **"Low Entry + Usage-Based Monetization"** с системой кредитов для максимизации retention и revenue при минимальном пороге входа.

**Ключевые принципы:**
- Минимальный порог входа (Free → $29/mo)
- Плата за использование через credits
- Auto top-up для seamless experience
- 90%+ gross margin на всех услугах

---

## 1. Pricing Plans

### 1.1 Plan Structure (3 тiers only)

| | **Free** | **Starter** | **Growth** |
|---|:---:|:---:|:---:|
| **Цена** | $0/mo | $29/mo | $79/mo |
| **Пользователи** | 1 | 5 | 15 |
| **Jobs/месяц** | 20 | 150 | Unlimited |
| **Clients** | 10 | 100 | Unlimited |
| **Included Credits** | 0 | 150 | 600 |
| **Credit Value** | - | $15 | $60 |
| **Top-up Enabled** | No | Yes | Yes |
| **Phone Number** | No | 1 included | 3 included |
| **Support** | Community | Email | Priority |

### 1.2 What's NOT Limited by Plan
- All features available (no feature-gating)
- Unlimited team collaboration within user limit
- Full API access
- All integrations
- Reports & Analytics

### 1.3 Upgrade Triggers
- Hit user limit → Upgrade plan
- Hit job limit → Upgrade plan
- Need more credits → Top-up or upgrade
- Need more phone numbers → Add-on or upgrade

---

## 2. Credit System

### 2.1 Credit Value
```
1 Credit = $0.10 USD
```

### 2.2 Credit Pricing Table

| Feature | Credits | $ Value | Our Cost | Margin |
|---------|---------|---------|----------|--------|
| **MESSAGING** |
| SMS Outbound | 2 | $0.20 | $0.004 | 5,000% |
| SMS Inbound | 1 | $0.10 | $0.00 | ∞ |
| AI Email Sent | 1 | $0.10 | $0.002 | 5,000% |
| **VOICE** |
| Voice Call (per min) | 2 | $0.20 | $0.009 | 2,100% |
| AI Dispatcher (per min) | 10 | $1.00 | $0.05 | 2,000% |
| Voicemail Transcription | 2 | $0.20 | $0.01 | 2,000% |
| **AI FEATURES** |
| AI Text Generation | 1 | $0.10 | $0.001 | 10,000% |
| AI Job Summary | 1 | $0.10 | $0.001 | 10,000% |
| Route Optimization | 3 | $0.30 | $0.01 | 3,000% |
| AI Chat Response | 1 | $0.10 | $0.001 | 10,000% |
| **DOCUMENTS** |
| Invoice/Estimate PDF | 2 | $0.20 | $0.001 | 20,000% |
| Contract Generation | 3 | $0.30 | $0.002 | 15,000% |
| **PHONE NUMBERS** |
| Additional Number (per mo) | 30 | $3.00 | $1.00 | 300% |
| Toll-Free Number (per mo) | 50 | $5.00 | $2.00 | 250% |

### 2.3 Credit Bundles (Top-Up)

| Package | Credits | Price | Bonus | Per Credit |
|---------|---------|-------|-------|------------|
| **Micro** | 50 | $5 | - | $0.100 |
| **Basic** | 100 | $10 | - | $0.100 |
| **Popular** | 300 | $25 | +20% | $0.083 |
| **Value** | 700 | $50 | +40% | $0.071 |
| **Pro** | 1,500 | $100 | +50% | $0.067 |

### 2.4 Auto Top-Up Rules

```yaml
auto_topup:
  enabled: true (default for paid plans)
  trigger_threshold: 20 credits
  default_amount: $25 (300 credits)
  max_monthly_limit: $200 (user configurable)
  notification_threshold: 50 credits

notifications:
  - at 50 credits: "Your balance is getting low"
  - at 20 credits: "Auto top-up triggered"
  - at 0 credits: "Actions paused - please top up"
```

---

## 3. Cost Analysis

### 3.1 Service Provider Costs

#### Telnyx (SMS & Voice)
| Service | Cost |
|---------|------|
| SMS Outbound (US) | $0.004/msg |
| SMS Inbound | FREE |
| Voice Outbound | $0.009/min |
| Voice Inbound | $0.0075/min |
| Phone Number (Local) | $1.00/mo |
| Phone Number (Toll-Free) | $2.00/mo |
| AI Dispatcher (full stack) | ~$0.05/min |

#### Mailgun (Email)
| Plan | Cost |
|------|------|
| Foundation Plan | $35/mo for 50K emails |
| Per Email | ~$0.0007/email |
| Flex (Pay-as-you-go) | $0.002/email |

#### Gemini 3 Flash (AI) - PRIMARY
| Metric | Cost |
|--------|------|
| Input Tokens | $0.50/1M tokens |
| Output Tokens | $3.00/1M tokens |
| Avg Request (~800 tokens) | ~$0.001 |
| Context Caching | 90% reduction available |
| Batch API | 50% cheaper |

**Notes on Gemini 3 Flash:**
- Released December 2025
- Default model in Gemini app
- 30% fewer tokens than 2.5 Pro
- 3x faster than previous versions
- Free tier available for testing

#### Supabase (Infrastructure)
| Plan | Cost |
|------|------|
| Pro Plan | $25/mo |
| Includes | 8GB DB, 250K Edge invocations |

### 3.2 Gross Margin Analysis

**Target: 90%+ Gross Margin**

| Category | Avg Our Cost | Avg Charge | Margin |
|----------|--------------|------------|--------|
| SMS | $0.002 | $0.15 | 98.7% |
| Voice | $0.03 | $0.60 | 95.0% |
| AI Features | $0.001 | $0.10 | 99.0% |
| Documents | $0.001 | $0.20 | 99.5% |
| **BLENDED AVG** | | | **97%** |

---

## 4. Revenue Projections

### 4.1 Per Customer Economics

| Customer Type | Plan | Usage Credits | Total MRR | Our Cost | Profit |
|---------------|------|---------------|-----------|----------|--------|
| Solo Tech | Free | 0 | $0 | $0 | $0 |
| Solo Tech | Starter | 200 | $34 | $1.50 | $32.50 |
| Small Team (3) | Starter | 400 | $54 | $3.00 | $51.00 |
| Medium Team (8) | Growth | 1,000 | $119 | $8.00 | $111.00 |
| Large Team (15) | Growth | 2,500 | $269 | $20.00 | $249.00 |

### 4.2 Scale Projections

#### Year 1 Target: 1,000 Customers
```
Customer Mix:
├── 400 Free (40%)        × $0     = $0
├── 350 Starter (35%)     × $54    = $18,900
├── 200 Growth (20%)      × $119   = $23,800
├── 50 Heavy Users (5%)   × $269   = $13,450
└── TOTAL MRR                      = $56,150

ARR: $673,800
Gross Margin: ~95%
```

#### Year 2 Target: 5,000 Customers
```
Customer Mix:
├── 1,500 Free (30%)      × $0     = $0
├── 2,000 Starter (40%)   × $54    = $108,000
├── 1,200 Growth (24%)    × $119   = $142,800
├── 300 Heavy Users (6%)  × $269   = $80,700
└── TOTAL MRR                      = $331,500

ARR: $3,978,000
```

#### Year 3 Target: 20,000 Customers (Unicorn Path)
```
Customer Mix:
├── 5,000 Free (25%)      × $0     = $0
├── 8,000 Starter (40%)   × $54    = $432,000
├── 5,000 Growth (25%)    × $150   = $750,000
├── 2,000 Heavy (10%)     × $350   = $700,000
└── TOTAL MRR                      = $1,882,000

ARR: $22,584,000

At 10x revenue multiple = $225M valuation
At 20x (AI premium) = $450M valuation
```

---

## 5. Competitive Advantage

### 5.1 Competitor Comparison

| Competitor | Entry Price | AI Features | Lock-in |
|------------|-------------|-------------|---------|
| ServiceTitan | $299+/mo | Extra cost | Annual |
| Housecall Pro | $79/mo | None | Monthly |
| Jobber | $69/mo | Basic | Monthly |
| FieldPulse | $99/mo | None | Monthly |
| **Fixlify** | **$0-29/mo** | **Included** | **None** |

### 5.2 Our Positioning
```
"Start free, pay only for what you use"

Key Messages:
├── No annual contracts
├── AI-powered from day one
├── Transparent usage-based pricing
├── Scale with your business
└── Switch anytime, no penalties
```

### 5.3 Moat Building
1. **AI Stickiness** - More usage = better AI = hard to leave
2. **Data Network Effects** - Customer data improves AI for all
3. **Habit Formation** - Credits create engagement loops
4. **Low Switching Cost Perception** - But high actual switching cost

---

## 6. Implementation Plan

### Phase 1: Database & Core (Week 1-2)
- [ ] Credit system database schema
- [ ] Usage tracking tables
- [ ] Transaction logging
- [ ] Balance management functions

### Phase 2: Billing Integration (Week 2-3)
- [ ] Stripe integration for top-ups
- [ ] Auto top-up logic
- [ ] Payment method management
- [ ] Invoice generation

### Phase 3: UI Components (Week 3-4)
- [ ] Credit balance widget (header)
- [ ] Top-up modal
- [ ] Usage history page
- [ ] Settings: auto top-up config
- [ ] Low balance alerts

### Phase 4: Usage Tracking (Week 4-5)
- [ ] SMS usage tracking
- [ ] Voice call tracking
- [ ] AI feature tracking
- [ ] Document generation tracking
- [ ] Real-time balance updates

### Phase 5: AI Migration (Week 5-6)
- [ ] Migrate from GPT-4 to Gemini 3 Flash
- [ ] Update all AI endpoints
- [ ] Implement caching for cost reduction
- [ ] A/B test quality

### Phase 6: Gamification (Week 6-7)
- [ ] Streak bonuses
- [ ] Referral credits
- [ ] Milestone rewards
- [ ] Loyalty tiers

### Phase 7: Testing & Launch (Week 7-8)
- [ ] Beta testing with select customers
- [ ] Pricing A/B tests
- [ ] Documentation
- [ ] Public launch

---

## 7. Database Schema (Draft)

```sql
-- Credit balances
CREATE TABLE credit_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  balance INTEGER DEFAULT 0,
  lifetime_credits INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Credit transactions
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  type TEXT NOT NULL, -- 'purchase', 'usage', 'bonus', 'refund', 'plan_credit'
  amount INTEGER NOT NULL, -- positive for credits, negative for usage
  balance_after INTEGER NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auto top-up settings
CREATE TABLE auto_topup_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) UNIQUE,
  enabled BOOLEAN DEFAULT true,
  trigger_threshold INTEGER DEFAULT 20,
  topup_amount INTEGER DEFAULT 300, -- credits
  topup_price INTEGER DEFAULT 2500, -- cents ($25)
  max_monthly_spend INTEGER DEFAULT 20000, -- cents ($200)
  current_month_spend INTEGER DEFAULT 0,
  payment_method_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Usage tracking
CREATE TABLE usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES profiles(id),
  feature TEXT NOT NULL, -- 'sms_outbound', 'ai_dispatcher', etc.
  credits_used INTEGER NOT NULL,
  metadata JSONB, -- job_id, message_id, call_duration, etc.
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Credit packages (for purchase)
CREATE TABLE credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  bonus_percent INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);
```

---

## 8. Key Metrics to Track

### 8.1 Business Metrics
- **MRR** (Monthly Recurring Revenue)
- **ARPU** (Average Revenue Per User)
- **LTV** (Lifetime Value)
- **CAC** (Customer Acquisition Cost)
- **Churn Rate**
- **Net Revenue Retention**

### 8.2 Credit-Specific Metrics
- **Credits Purchased vs Used**
- **Top-up Frequency**
- **Average Credit Balance**
- **Auto Top-up Trigger Rate**
- **Credit Burn Rate**
- **Feature Usage Distribution**

### 8.3 AI Metrics
- **AI Calls per Customer**
- **AI Satisfaction (thumbs up/down)**
- **AI Cost per Request**
- **Token Usage Efficiency**

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Price too high | Low adoption | A/B test, competitor monitoring |
| Price too low | Margin erosion | Monitor costs, adjust pricing |
| AI costs spike | Margin hit | Caching, rate limiting, model switching |
| Telnyx rate increase | Cost increase | Multi-provider strategy |
| Customer confusion | Support load | Clear UI, tooltips, onboarding |
| Abuse/Fraud | Revenue loss | Rate limits, fraud detection |

---

## 10. Open Questions

- [ ] Should we offer annual plans with discount?
- [ ] Enterprise tier needed? Custom pricing?
- [ ] Credit expiration? (Currently: no expiration)
- [ ] Rollover unused plan credits?
- [ ] Refund policy for unused credits?
- [ ] Free trial period for paid plans?
- [ ] White-label/reseller pricing?

---

## 11. Next Steps

1. **Review this document** - Mark corrections/changes
2. **Finalize pricing** - Confirm credit values
3. **Design mockups** - UI/UX for credit system
4. **Start Phase 1** - Database schema implementation
5. **Set up Gemini 3 Flash** - API integration

---

## Appendix A: Gemini 3 Flash Integration

### API Configuration
```typescript
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = gemini.getGenerativeModel({
  model: "gemini-3-flash",
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 1024,
  }
});
```

### Cost Calculation
```
Gemini 3 Flash Pricing:
- Input:  $0.50 per 1M tokens
- Output: $3.00 per 1M tokens

Average Request (800 tokens total):
- 500 input tokens  = $0.00025
- 300 output tokens = $0.0009
- Total: ~$0.00115 per request

With Context Caching (90% reduction):
- Total: ~$0.000115 per request
```

### Migration from GPT-4
```
Current GPT-4 cost: ~$0.05 per request
Gemini 3 Flash cost: ~$0.001 per request

Savings: 98% cost reduction
```

---

## Appendix B: Sources & References

- [Telnyx Pricing](https://telnyx.com/pricing)
- [Mailgun Pricing](https://www.mailgun.com/pricing/)
- [Gemini 3 Flash Announcement](https://blog.google/products/gemini/gemini-3-flash/)
- [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [2026 SaaS Pricing Trends](https://startupill.com/2026-saas-roadmap-for-founders/)

---

*Document created: January 2026*
*For internal use only*
