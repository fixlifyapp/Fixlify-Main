# Fixlify Evaluation System Proposal

## Research Summary from Industry Experts

Based on research from Fred Reichheld (NPS creator), ServiceTitan, Housecall Pro, and field service management experts, here's what we can implement.

---

## 🎯 The Three Core Metrics (Industry Standard)

| Metric | What it Measures | When to Use | Scale |
|--------|------------------|-------------|-------|
| **NPS** (Net Promoter Score) | Customer loyalty & referrals | Quarterly or after major milestones | 0-10 |
| **CSAT** (Customer Satisfaction) | Immediate job satisfaction | After every job | 1-5 stars |
| **CES** (Customer Effort Score) | Ease of doing business | After interactions | 1-5 scale |

**Source**: [Retently](https://www.retently.com/blog/customer-satisfaction-metrics/) - "Companies that consistently track NPS, CSAT and CES outperform competitors in customer retention, loyalty and revenue growth."

---

## 📊 Recommended Implementation for Fixlify

### Phase 1: Post-Job Customer Feedback (CSAT)

**Trigger**: Automatically send after job status changes to "Completed" and invoice is paid

**Channels**:
- SMS (primary - 98% open rate)
- Email (backup)

**Survey Questions**:
1. **Star Rating** (1-5): "How satisfied were you with the service?"
2. **Technician Rating** (1-5): "How would you rate [Technician Name]?"
3. **Would Recommend?** (Yes/No): Quick NPS proxy
4. **Open Comment**: "Any feedback for us?"

**Timing**: Send 2-4 hours after job completion (strike while iron is hot)

**Source**: [Textellent](https://textellent.com/blog/sms-review-request/) - "Once a service is completed, automatically send an SMS review request while the experience is still fresh."

---

### Phase 2: Automated Review Collection (Google/Yelp)

**Logic Flow**:
```
Customer gives 4-5 stars internally
    → Send SMS: "Thanks! Would you share this on Google?"
    → Include direct Google Review link

Customer gives 1-3 stars internally
    → Send SMS: "Sorry to hear that. Our manager will reach out."
    → Create internal alert for follow-up
    → DO NOT ask for public review
```

**Source**: [GoReminders](https://www.goreminders.com/automated-review-request-software-for-small-businesses) - "After an appointment or service is completed, automatically request reviews via email or text."

---

### Phase 3: Technician Performance Dashboard

**Key Performance Indicators (KPIs)**:

| KPI | Description | Target |
|-----|-------------|--------|
| **First-Time Fix Rate** | Jobs completed without return visit | >85% |
| **Average Job Rating** | Mean CSAT from customers | >4.5/5 |
| **Jobs Per Day** | Efficiency metric | 3-5 jobs |
| **On-Time Arrival** | % of jobs where tech arrived in window | >90% |
| **Callback Rate** | % requiring return visit | <10% |
| **Revenue per Job** | Average invoice amount | Track trend |

**Source**: [FieldEx](https://www.fieldex.com/blog/how-to-conduct-performance-evaluations-for-field-service-technicians) - "Track KPIs like service response time, job completion rate, and customer satisfaction."

**Source**: [ServiceTitan](https://www.servicetitan.com/blog/field-service-metrics) - "First-time fix Rate, Mean Time to Repair, and Customer Satisfaction Scores can identify where technicians need more training."

---

### Phase 4: Net Promoter Score (NPS) - Quarterly Survey

**The Question**: "On a scale of 0-10, how likely are you to recommend Fixlify to a friend or colleague?"

**Scoring**:
- **Promoters** (9-10): Loyal enthusiasts
- **Passives** (7-8): Satisfied but unenthusiastic
- **Detractors** (0-6): Unhappy customers

**NPS = % Promoters - % Detractors**

**Industry Benchmarks**:
- Good: > 0
- Great: > 30
- Excellent: > 50
- World-class: > 70

**Source**: [Fred Reichheld via CXOTalk](https://www.cxotalk.com/episode/what-net-promoter-score-how-use-it-nps-creator) - "Big NPS is a philosophy that puts customers first. The only way to succeed is to make sure customers are so happy they are referring friends."

---

## 🗄️ Database Schema Design

### New Tables Needed

```sql
-- Customer satisfaction surveys
CREATE TABLE customer_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  technician_id UUID REFERENCES team_members(id),
  survey_type TEXT CHECK (survey_type IN ('csat', 'nps', 'ces')),

  -- Ratings
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  technician_rating INTEGER CHECK (technician_rating BETWEEN 1 AND 5),
  would_recommend BOOLEAN,
  nps_score INTEGER CHECK (nps_score BETWEEN 0 AND 10),
  effort_score INTEGER CHECK (effort_score BETWEEN 1 AND 5),

  -- Feedback
  comment TEXT,
  internal_notes TEXT,

  -- Status
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  channel TEXT CHECK (channel IN ('sms', 'email', 'portal')),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Google review requests tracking
CREATE TABLE review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES customer_surveys(id),
  client_id UUID REFERENCES clients(id),
  platform TEXT CHECK (platform IN ('google', 'yelp', 'facebook')),
  sent_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  review_posted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Technician performance metrics (calculated daily)
CREATE TABLE technician_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES team_members(id),
  metric_date DATE NOT NULL,

  -- KPIs
  jobs_completed INTEGER DEFAULT 0,
  first_time_fix_rate DECIMAL(5,2),
  average_rating DECIMAL(3,2),
  on_time_rate DECIMAL(5,2),
  callback_rate DECIMAL(5,2),
  total_revenue DECIMAL(10,2),

  -- Aggregations
  promoters_count INTEGER DEFAULT 0,
  detractors_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),

  UNIQUE(technician_id, metric_date)
);
```

---

## 📱 UI Components Needed

### 1. Survey Widget (Customer-Facing Portal)
- Star rating component
- Emoji scale for effort
- Comment box
- Submit button with thank you animation

### 2. Feedback Dashboard (Admin)
- Overall CSAT trend chart
- NPS gauge
- Technician leaderboard
- Recent feedback list with sentiment icons
- Alert section for negative feedback

### 3. Technician Profile Enhancement
- Performance stats card
- Rating history chart
- Recent reviews carousel
- Comparison to team average

### 4. Automation Settings Page
- Toggle survey auto-send
- Configure delay timing
- Set review request threshold (4+ stars)
- Google/Yelp place ID configuration

---

## 🔄 Automation Workflows

### Workflow 1: Post-Job Survey
```
TRIGGER: Job status → "Completed" AND Invoice status → "Paid"
DELAY: 2 hours
ACTION: Send CSAT survey via SMS
CONDITION: Customer has phone number
FALLBACK: Send via email if no phone
```

### Workflow 2: Review Request
```
TRIGGER: Survey completed with rating >= 4
DELAY: 1 day
ACTION: Send Google review request
CONDITION: Haven't requested review in last 30 days
```

### Workflow 3: Negative Feedback Alert
```
TRIGGER: Survey completed with rating <= 2
DELAY: Immediate
ACTION:
  - Create task for manager
  - Send internal Slack/email notification
  - Log in customer_issues table
```

### Workflow 4: NPS Campaign (Quarterly)
```
TRIGGER: Scheduled quarterly (1st of Jan, Apr, Jul, Oct)
AUDIENCE: All customers with completed jobs in last 90 days
ACTION: Send NPS survey via email
EXCLUSION: Don't send to detractors from previous NPS
```

---

## 📈 Analytics & Reporting

### Key Dashboards

1. **Customer Satisfaction Overview**
   - CSAT trend (last 30/90/365 days)
   - NPS score with trend
   - Rating distribution pie chart
   - Word cloud from comments

2. **Technician Leaderboard**
   - Ranking by average rating
   - First-time fix rate comparison
   - Jobs completed bar chart
   - Revenue contribution

3. **Review Analytics**
   - Total reviews collected
   - Platform breakdown (Google vs Yelp)
   - Conversion rate (survey → review)
   - Star rating average on public platforms

---

## 🚀 Implementation Roadmap

### Week 1-2: Database & Backend
- [ ] Create migration for new tables
- [ ] Build Edge Function: `send-survey`
- [ ] Build Edge Function: `send-review-request`
- [ ] Create Supabase Triggers for automation

### Week 3-4: Customer Portal Survey Page
- [ ] Build `/survey/{token}` page
- [ ] Star rating component
- [ ] NPS scale component
- [ ] Thank you page with conditional review link

### Week 5-6: Admin Dashboard
- [ ] Feedback dashboard page
- [ ] Technician performance cards
- [ ] Analytics charts (recharts)
- [ ] Export reports functionality

### Week 7-8: Automation & Integration
- [ ] Workflow automation engine
- [ ] Settings page for configuration
- [ ] SMS/Email templates
- [ ] Testing & QA

---

## 💡 Quick Wins We Can Do Now

1. **Simple CSAT after job** - Just add a rating field to job completion
2. **Manual review request** - Button in job details to send Google link
3. **Technician rating field** - Add to existing job form
4. **Basic metrics calculation** - Aggregate queries for dashboard

---

## 🎯 Success Metrics

| Metric | Current | Target (3 months) | Target (6 months) |
|--------|---------|-------------------|-------------------|
| Response Rate | 0% | 30% | 50% |
| Average CSAT | N/A | 4.2/5 | 4.5/5 |
| NPS Score | N/A | +20 | +40 |
| Google Reviews/Month | ? | 10 | 25 |
| First-Time Fix Rate | ? | 80% | 90% |

---

## References

1. [Retently - Customer Satisfaction Metrics](https://www.retently.com/blog/customer-satisfaction-metrics/)
2. [Fred Reichheld on NPS](https://www.cxotalk.com/episode/what-net-promoter-score-how-use-it-nps-creator)
3. [FieldEx - Technician Performance Evaluations](https://www.fieldex.com/blog/how-to-conduct-performance-evaluations-for-field-service-technicians)
4. [ServiceTitan - Field Service Metrics](https://www.servicetitan.com/blog/field-service-metrics)
5. [Textellent - SMS Review Requests](https://textellent.com/blog/sms-review-request/)
6. [GoReminders - Automated Review Requests](https://www.goreminders.com/automated-review-request-software-for-small-businesses)
7. [CustomerGauge - NPS Guide](https://customergauge.com/net-promoter-score-nps)
8. [Zonka Feedback - NPS Guide](https://www.zonkafeedback.com/guides/net-promoter-score-guide)

---

*Document created: January 2026*
*For: Fixlify Repair Shop Management System*
