# 💰 Fixlify Estimates & Invoices System - Complete Documentation
*Last Updated: January 31, 2025*

## 📋 Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Estimate System](#estimate-system)
4. [Invoice System](#invoice-system)
5. [Number Generation](#number-generation)
6. [Email & SMS Delivery](#email--sms-delivery)
7. [Client Portal](#client-portal)
8. [Payment Processing](#payment-processing)
9. [Database Schema](#database-schema)
10. [API Reference](#api-reference)
11. [UI Components](#ui-components)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The Fixlify Estimates & Invoices System provides comprehensive financial document management for service businesses, including creation, delivery, tracking, and payment collection.

### Key Features
- 📄 Professional PDF generation
- 📧 Multi-channel delivery (Email/SMS)
- 🌐 Client portal access
- 💳 Payment processing
- 📊 Financial analytics
- 🔄 Automated workflows
- 📱 Mobile-responsive design

### Business Benefits
- Faster payment cycles
- Reduced administrative overhead
- Improved cash flow visibility
- Enhanced customer experience
- Automated follow-ups

---

## 🏗️ System Architecture

### Component Overview
```
Frontend (React)
    ├── Estimate Components
    │   ├── EstimatesList
    │   ├── EstimateForm
    │   └── EstimatePreview
    ├── Invoice Components
    │   ├── InvoicesList
    │   ├── InvoiceForm
    │   └── InvoicePreview
    └── Portal Components
        ├── EstimatePortal
        └── InvoicePortal

Backend (Supabase)
    ├── Database Tables
    │   ├── estimates
    │   ├── invoices
    │   └── payments
    ├── Edge Functions
    │   ├── send-estimate
    │   ├── send-invoice
    │   └── process-payment
    └── Storage
        └── PDF Documents
```

### Data Flow
```
Job Creation → Estimate Generation → Client Approval → Invoice Creation → Payment Collection
```

---

## 📋 Estimate System

### Estimate Model
```typescript
interface Estimate {
  id: string;
  estimate_number: string;      // Format: EST-XXXX
  job_id: string;
  client_id: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  total: number;
  subtotal: number;
  tax_amount: number;
  tax_rate: number;
  discount_amount?: number;
  discount_percentage?: number;
  valid_until?: Date;
  items: EstimateItem[];
  notes?: string;
  terms?: string;
  created_at: Date;
  updated_at: Date;
  sent_at?: Date;
  viewed_at?: Date;
  accepted_at?: Date;
  rejected_at?: Date;
  accepted_by?: string;
  rejection_reason?: string;
  organization_id: string;
  created_by: string;
}

interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  tax_rate?: number;
  discount?: number;
  product_id?: string;
}
```

### Estimate Lifecycle
1. **Draft** → Created but not sent
2. **Sent** → Delivered to client
3. **Viewed** → Client opened estimate
4. **Accepted** → Client approved
5. **Rejected** → Client declined
6. **Expired** → Past validity date

### Creating Estimates

#### UI Component (`EstimateForm.tsx`)
```typescript
const EstimateForm = ({ jobId, onSave }) => {
  const [items, setItems] = useState<EstimateItem[]>([]);
  
  const handleSubmit = async (data) => {
    const estimate = await estimateService.create({
      job_id: jobId,
      items,
      valid_until: addDays(new Date(), 30),
      ...data
    });
    onSave(estimate);
  };
};
```

#### Service Layer (`estimate-service.ts`)
```typescript
class EstimateService {
  async create(data: CreateEstimateDto): Promise<Estimate> {
    // Generate estimate number
    const estimateNumber = await this.generateEstimateNumber();
    
    // Calculate totals
    const totals = this.calculateTotals(data.items);
    
    // Create estimate
    const estimate = await supabase
      .from('estimates')
      .insert({
        ...data,
        estimate_number: estimateNumber,
        ...totals,
        status: 'draft'
      })
      .select()
      .single();
      
    return estimate;
  }
  
  private calculateTotals(items: EstimateItem[]) {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount - discountAmount;
    
    return { subtotal, tax_amount: taxAmount, total };
  }
}
```

### Estimate Templates
```typescript
const estimateTemplates = {
  standard: {
    terms: "Valid for 30 days. Prices subject to change.",
    notes: "Thank you for considering our services.",
    tax_rate: 8.5
  },
  rush: {
    terms: "Valid for 7 days. Rush service rates apply.",
    notes: "Priority scheduling available upon acceptance.",
    tax_rate: 8.5
  }
};
```

---

## 📄 Invoice System

### Invoice Model
```typescript
interface Invoice {
  id: string;
  invoice_number: string;       // Format: INV-XXXX
  job_id: string;
  client_id: string;
  estimate_id?: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded';
  total: number;
  subtotal: number;
  tax_amount: number;
  tax_rate: number;
  discount_amount?: number;
  amount_paid: number;
  balance_due: number;
  due_date?: Date;
  items: InvoiceItem[];
  notes?: string;
  terms?: string;
  created_at: Date;
  updated_at: Date;
  sent_at?: Date;
  viewed_at?: Date;
  paid_at?: Date;
  organization_id: string;
  created_by: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  tax_rate?: number;
  product_id?: string;
}
```

### Invoice Lifecycle
1. **Draft** → Created but not sent
2. **Sent** → Delivered to client
3. **Viewed** → Client opened invoice
4. **Partial** → Partially paid
5. **Paid** → Fully paid
6. **Overdue** → Past due date
7. **Cancelled** → Voided

### Creating Invoices

#### From Estimate
```typescript
async function createInvoiceFromEstimate(estimateId: string) {
  const estimate = await getEstimate(estimateId);
  
  const invoice = await invoiceService.create({
    job_id: estimate.job_id,
    estimate_id: estimate.id,
    items: estimate.items,
    tax_rate: estimate.tax_rate,
    due_date: addDays(new Date(), 30)
  });
  
  return invoice;
}
```

#### Manual Creation
```typescript
const InvoiceForm = ({ jobId }) => {
  const handleSubmit = async (data) => {
    const invoice = await invoiceService.create({
      job_id: jobId,
      items: data.items,
      due_date: data.dueDate,
      terms: data.terms
    });
  };
};
```

### Payment Terms
```typescript
const paymentTerms = {
  immediate: { days: 0, text: "Due upon receipt" },
  net15: { days: 15, text: "Net 15 days" },
  net30: { days: 30, text: "Net 30 days" },
  net45: { days: 45, text: "Net 45 days" },
  net60: { days: 60, text: "Net 60 days" }
};
```

---

## 🔢 Number Generation

### Global Counter System
```sql
-- Atomic number generation function
CREATE OR REPLACE FUNCTION get_next_document_number(
  p_doc_type TEXT,
  p_organization_id UUID
) RETURNS TEXT AS $$
DECLARE
  v_counter INT;
  v_prefix TEXT;
BEGIN
  -- Get prefix based on document type
  v_prefix := CASE p_doc_type
    WHEN 'estimate' THEN 'EST-'
    WHEN 'invoice' THEN 'INV-'
    ELSE 'DOC-'
  END;
  
  -- Get and increment counter atomically
  UPDATE id_counters
  SET counter = counter + 1
  WHERE type = p_doc_type
    AND organization_id = p_organization_id
  RETURNING counter INTO v_counter;
  
  -- Create if doesn't exist
  IF NOT FOUND THEN
    INSERT INTO id_counters (type, counter, organization_id)
    VALUES (p_doc_type, 1001, p_organization_id)
    ON CONFLICT (type, organization_id) DO UPDATE
    SET counter = id_counters.counter + 1
    RETURNING counter INTO v_counter;
  END IF;
  
  RETURN v_prefix || v_counter::TEXT;
END;
$$ LANGUAGE plpgsql;
```

### Client-Side Usage
```typescript
async function generateNextId(type: 'estimate' | 'invoice') {
  const { data, error } = await supabase
    .rpc('get_next_document_number', {
      p_doc_type: type,
      p_organization_id: organizationId
    });
    
  if (error) throw error;
  return data; // Returns 'EST-1001' or 'INV-1001'
}
```

---

## 📧 Email & SMS Delivery

### Email Templates

#### Professional Email Design
```html
<!-- Clean, table-based layout for compatibility -->
<table role="presentation" width="600">
  <tr>
    <td style="background-color: #4F46E5; padding: 40px;">
      <h1 style="color: #ffffff;">Invoice Ready</h1>
    </td>
  </tr>
  <tr>
    <td style="padding: 40px;">
      <p>Hi {{clientName}},</p>
      <p>Your invoice is ready for review.</p>
      
      <!-- Amount Box -->
      <table style="background-color: #F3F4F6;">
        <tr>
          <td style="text-align: center; padding: 30px;">
            <p>INVOICE #{{invoiceNumber}}</p>
            <p style="font-size: 36px; color: #4F46E5;">
              ${{total}}
            </p>
          </td>
        </tr>
      </table>
      
      <!-- CTA Button -->
      <table>
        <tr>
          <td align="center">
            <a href="{{portalLink}}" style="background-color: #4F46E5; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px;">
              View & Pay Invoice
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
```

### Edge Functions

#### send-estimate
```typescript
serve(async (req) => {
  const { estimateId, recipientEmail } = await req.json();
  
  // Get estimate data
  const estimate = await getEstimate(estimateId);
  
  // Generate portal link
  const portalLink = `http://localhost:8080/estimate/${estimate.id}`;
  
  // Create email
  const emailHtml = createProfessionalEstimateTemplate({
    companyName,
    clientName: estimate.client.name,
    estimateNumber: estimate.estimate_number,
    total: estimate.total,
    portalLink
  });
  
  // Send via Mailgun
  await sendEmail({
    to: recipientEmail,
    subject: `Estimate #${estimate.estimate_number}`,
    html: emailHtml
  });
});
```

#### send-invoice
```typescript
serve(async (req) => {
  const { invoiceId, recipientEmail } = await req.json();
  
  // Similar to send-estimate but for invoices
  // Includes payment link and due date
});
```

### SMS Delivery
```typescript
async function sendInvoiceSMS(invoiceId: string, phone: string) {
  const invoice = await getInvoice(invoiceId);
  const portalLink = `http://localhost:8080/invoice/${invoice.id}`;
  
  const message = `Hi ${invoice.client.name}! ` +
    `Invoice #${invoice.invoice_number} for $${invoice.total} is ready. ` +
    `View and pay: ${portalLink}`;
    
  await telnyxService.sendSMS({
    to: formatPhoneNumber(phone),
    message
  });
}
```

---

## 🌐 Client Portal

### Portal Components

#### EstimatePortal (`/src/pages/EstimatePortal.tsx`)
```typescript
const EstimatePortal = () => {
  const { estimateId } = useParams();
  const [estimate, setEstimate] = useState<Estimate>();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Card>
        <CardHeader>
          <h1>Estimate #{estimate.estimate_number}</h1>
          <Badge>{estimate.status}</Badge>
        </CardHeader>
        <CardContent>
          {/* Line items table */}
          {/* Total display */}
          {/* Action buttons */}
        </CardContent>
      </Card>
    </div>
  );
};
```

#### InvoicePortal (`/src/pages/InvoicePortal.tsx`)
```typescript
const InvoicePortal = () => {
  // Similar to EstimatePortal
  // Includes payment functionality
};
```

### Portal Features
- No login required (token-based access)
- Mobile-responsive design
- Real-time status updates
- Secure payment processing
- PDF download
- Communication history

### Portal Access Tokens
```typescript
// Generate secure access token
const { data: token } = await supabase.rpc('generate_portal_access', {
  p_client_id: clientId,
  p_permissions: {
    view_estimates: true,
    view_invoices: true,
    make_payments: true
  },
  p_hours_valid: 72
});

const portalUrl = `https://hub.fixlify.app/portal/${token}`;
```

---

## 💳 Payment Processing

### Payment Model
```typescript
interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: 'credit_card' | 'ach' | 'cash' | 'check' | 'other';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  reference_number?: string;
  processed_at?: Date;
  gateway_response?: any;
  notes?: string;
  created_by: string;
  created_at: Date;
}
```

### Payment Flow
1. Client views invoice in portal
2. Clicks "Pay Now" button
3. Enters payment information
4. Payment processed via gateway
5. Invoice updated to "paid"
6. Receipt sent automatically

### Recording Payments
```typescript
async function recordPayment(invoiceId: string, paymentData: PaymentData) {
  // Start transaction
  const { data: payment } = await supabase
    .from('payments')
    .insert({
      invoice_id: invoiceId,
      amount: paymentData.amount,
      payment_method: paymentData.method,
      reference_number: paymentData.reference,
      status: 'completed'
    })
    .select()
    .single();
    
  // Update invoice
  const invoice = await getInvoice(invoiceId);
  const newAmountPaid = invoice.amount_paid + payment.amount;
  const newStatus = newAmountPaid >= invoice.total ? 'paid' : 'partial';
  
  await supabase
    .from('invoices')
    .update({
      amount_paid: newAmountPaid,
      balance_due: invoice.total - newAmountPaid,
      status: newStatus,
      payment_status: newStatus === 'paid' ? 'paid' : 'partial',
      paid_at: newStatus === 'paid' ? new Date() : null
    })
    .eq('id', invoiceId);
    
  // Send receipt
  await sendPaymentReceipt(payment);
  
  return payment;
}
```

---

## 🗄️ Database Schema

### Tables

#### estimates
```sql
CREATE TABLE estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_number TEXT UNIQUE NOT NULL,
  job_id TEXT REFERENCES jobs(id),
  status TEXT DEFAULT 'draft',
  total NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  valid_until DATE,
  items JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  terms TEXT,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  organization_id UUID REFERENCES organizations(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_estimates_job ON estimates(job_id);
CREATE INDEX idx_estimates_status ON estimates(status);
CREATE INDEX idx_estimates_org ON estimates(organization_id);
```

#### invoices
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  job_id TEXT REFERENCES jobs(id),
  estimate_id UUID REFERENCES estimates(id),
  status TEXT DEFAULT 'draft',
  payment_status TEXT DEFAULT 'pending',
  total NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  amount_paid NUMERIC(10,2) DEFAULT 0,
  balance_due NUMERIC(10,2) NOT NULL,
  due_date DATE,
  items JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  terms TEXT,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  organization_id UUID REFERENCES organizations(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### payments
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id),
  amount NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  reference_number TEXT,
  processed_at TIMESTAMPTZ,
  gateway_response JSONB,
  notes TEXT,
  organization_id UUID REFERENCES organizations(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Communication Tracking
```sql
CREATE TABLE estimate_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID REFERENCES estimates(id),
  communication_type TEXT, -- 'email' | 'sms'
  recipient TEXT,
  subject TEXT,
  content TEXT,
  status TEXT,
  provider_message_id TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invoice_communications (
  -- Similar structure for invoices
);
```

---

## 🔌 API Reference

### Estimate Endpoints

#### Create Estimate
```typescript
POST /api/estimates
{
  job_id: string,
  items: EstimateItem[],
  valid_until?: Date,
  notes?: string,
  terms?: string
}
```

#### Send Estimate
```typescript
POST /api/estimates/:id/send
{
  recipient_email: string,
  recipient_phone?: string,
  custom_message?: string
}
```

#### Update Estimate Status
```typescript
PATCH /api/estimates/:id/status
{
  status: 'accepted' | 'rejected',
  reason?: string
}
```

### Invoice Endpoints

#### Create Invoice
```typescript
POST /api/invoices
{
  job_id: string,
  estimate_id?: string,
  items: InvoiceItem[],
  due_date?: Date,
  notes?: string,
  terms?: string
}
```

#### Record Payment
```typescript
POST /api/invoices/:id/payments
{
  amount: number,
  payment_method: string,
  reference_number?: string,
  notes?: string
}
```

---

## 🎨 UI Components

### EstimatesList Component
```typescript
const EstimatesList = () => {
  const { data: estimates } = useEstimates();
  
  return (
    <DataTable
      columns={[
        { header: 'Number', accessor: 'estimate_number' },
        { header: 'Client', accessor: 'client.name' },
        { header: 'Total', accessor: 'total', format: 'currency' },
        { header: 'Status', accessor: 'status', render: StatusBadge },
        { header: 'Actions', render: EstimateActions }
      ]}
      data={estimates}
    />
  );
};
```

### InvoiceForm Component
```typescript
const InvoiceForm = ({ job, onSave }) => {
  const form = useForm<InvoiceFormData>();
  const [items, setItems] = useState<InvoiceItem[]>([]);
  
  return (
    <Form onSubmit={handleSubmit}>
      <LineItemsEditor
        items={items}
        onChange={setItems}
        products={products}
      />
      <TotalsCalculator items={items} taxRate={8.5} />
      <PaymentTermsSelector />
      <NotesEditor />
      <Button type="submit">Create Invoice</Button>
    </Form>
  );
};
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Duplicate Number Generation
**Problem**: Same estimate/invoice number generated twice
**Solution**: Use atomic database function with proper locking

#### 2. Email Delivery Failures
**Problem**: Emails not reaching clients
**Solution**: 
- Check Mailgun API key
- Verify domain configuration
- Check spam folders
- Review email logs

#### 3. Portal Access Issues
**Problem**: Client can't access portal
**Solution**:
- Verify token hasn't expired
- Check domain restrictions
- Ensure correct URL format
- Review CORS settings

#### 4. Payment Recording
**Problem**: Payments not updating invoice status
**Solution**:
- Check transaction logic
- Verify amount calculations
- Review status update triggers
- Check for race conditions

### Debug Queries
```sql
-- Check recent estimates
SELECT * FROM estimates
WHERE organization_id = 'xxx'
ORDER BY created_at DESC
LIMIT 10;

-- Find unpaid invoices
SELECT * FROM invoices
WHERE payment_status != 'paid'
AND organization_id = 'xxx'
ORDER BY due_date ASC;

-- Payment reconciliation
SELECT 
  i.invoice_number,
  i.total,
  i.amount_paid,
  i.balance_due,
  COUNT(p.id) as payment_count,
  SUM(p.amount) as payments_total
FROM invoices i
LEFT JOIN payments p ON i.id = p.invoice_id
WHERE i.organization_id = 'xxx'
GROUP BY i.id
HAVING i.amount_paid != COALESCE(SUM(p.amount), 0);
```

---

## 📊 Analytics & Reporting

### Key Metrics
```typescript
interface FinancialMetrics {
  estimates: {
    total_value: number;
    acceptance_rate: number;
    average_value: number;
    pending_count: number;
  };
  invoices: {
    total_outstanding: number;
    average_payment_time: number;
    overdue_count: number;
    collection_rate: number;
  };
  revenue: {
    monthly_total: number;
    ytd_total: number;
    growth_rate: number;
  };
}
```

### Reports
1. **Aging Report**: Outstanding invoices by age
2. **Cash Flow**: Expected vs actual payments
3. **Client Summary**: Financial history per client
4. **Tax Report**: Tax collected by period

---

*This comprehensive documentation covers all aspects of the Fixlify Estimates & Invoices System. For implementation details, refer to the specific code files.*