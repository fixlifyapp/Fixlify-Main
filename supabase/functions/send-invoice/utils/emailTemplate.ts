interface EmailTemplateData {
  companyName: string;
  companyLogo?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;
  clientName?: string;
  invoiceNumber: string;
  total: number;
  amountDue: number;
  invoiceLink: string;
  portalLink?: string;
}

export const createInvoiceEmailTemplate = (data: EmailTemplateData): string => {
  const {
    companyName,
    companyLogo,
    companyPhone,
    companyEmail,
    clientName,
    invoiceNumber,
    total,
    amountDue,
    invoiceLink,
    portalLink,
    companyWebsite
  } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice Ready for Payment</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      margin: 0; 
      padding: 0; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .email-container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: #ffffff; 
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
    .header { 
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); 
      padding: 40px 30px; 
      text-align: center; 
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: shimmer 3s ease-in-out infinite;
    }
    @keyframes shimmer {
      0%, 100% { transform: translateX(-100%) translateY(-100%) rotate(0deg); }
      50% { transform: translateX(0%) translateY(0%) rotate(180deg); }
    }
    .logo { 
      max-height: 80px; 
      margin-bottom: 20px; 
      border-radius: 12px;
      background: rgba(255,255,255,0.2);
      padding: 15px;
      backdrop-filter: blur(10px);
    }
    .header-content {
      position: relative;
      z-index: 2;
    }
    .header-text { 
      color: #ffffff; 
      font-size: 28px; 
      font-weight: 700; 
      margin: 0; 
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
      letter-spacing: -0.5px;
    }
    .header-subtitle {
      color: rgba(255,255,255,0.9);
      font-size: 16px;
      margin-top: 8px;
      font-weight: 400;
    }
    .content { 
      padding: 50px 40px; 
      background: #ffffff;
    }
    .greeting { 
      font-size: 20px; 
      color: #1a1a1a; 
      margin-bottom: 24px; 
      font-weight: 600;
    }
    .intro-text {
      color: #4a5568;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    .invoice-card { 
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      border: 2px solid #fecaca; 
      border-radius: 16px; 
      padding: 32px; 
      margin: 32px 0; 
      text-align: center; 
      position: relative;
      overflow: hidden;
    }
    .invoice-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #dc2626 0%, #b91c1c 100%);
    }
    .invoice-badge {
      display: inline-block;
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      color: white;
      padding: 8px 20px;
      border-radius: 50px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .invoice-title { 
      font-size: 24px; 
      font-weight: 700; 
      color: #1a1a1a; 
      margin-bottom: 8px; 
    }
    .invoice-number { 
      font-size: 16px; 
      color: #718096; 
      margin-bottom: 20px; 
      font-weight: 500;
    }
    .invoice-amounts {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 24px 0;
    }
    .amount-item {
      text-align: center;
    }
    .amount-label {
      font-size: 14px;
      color: #718096;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .amount-value {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
    }
    .amount-due {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-size: 32px;
    }
    .portal-button { 
      display: inline-block; 
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); 
      color: #ffffff; 
      text-decoration: none; 
      padding: 16px 32px; 
      border-radius: 12px; 
      font-weight: 600; 
      font-size: 16px; 
      margin: 24px 0; 
      box-shadow: 0 8px 25px rgba(220, 38, 38, 0.3); 
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .portal-button:hover { 
      transform: translateY(-2px); 
      box-shadow: 0 12px 35px rgba(220, 38, 38, 0.4); 
    }
    .features-list {
      margin-top: 20px;
      text-align: left;
      display: inline-block;
    }
    .feature-item {
      display: flex;
      align-items: center;
      margin: 8px 0;
      color: #4a5568;
      font-size: 14px;
    }
    .feature-icon {
      width: 20px;
      height: 20px;
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      color: white;
      font-size: 12px;
      font-weight: bold;
    }
    .urgent-note { 
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); 
      border: 2px solid #f59e0b; 
      border-radius: 12px; 
      padding: 20px; 
      margin: 24px 0; 
      color: #92400e;
      border-left: 4px solid #f59e0b;
    }
    .urgent-note strong {
      display: block;
      margin-bottom: 8px;
      font-size: 16px;
    }
    .company-info-section {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      border-radius: 12px;
      padding: 24px;
      margin: 32px 0;
      border-left: 4px solid #dc2626;
    }
    .company-info-title {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 16px;
    }
    .company-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }
    .company-detail {
      display: flex;
      align-items: center;
      color: #4a5568;
      font-size: 14px;
    }
    .company-detail-icon {
      width: 16px;
      height: 16px;
      margin-right: 8px;
      opacity: 0.7;
    }
    .footer { 
      background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%); 
      padding: 40px 30px; 
      text-align: center; 
      color: white;
    }
    .footer-content {
      max-width: 400px;
      margin: 0 auto;
    }
    .footer-logo {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 16px;
      color: white;
    }
    .footer-text {
      color: rgba(255,255,255,0.8);
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    @media (max-width: 600px) {
      body { padding: 10px; }
      .content { padding: 30px 20px; }
      .invoice-card { padding: 24px 16px; margin: 20px 0; }
      .portal-button { padding: 14px 24px; font-size: 14px; }
      .header { padding: 30px 20px; }
      .invoice-amounts { grid-template-columns: 1fr; gap: 16px; }
      .company-details { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="header-content">
        ${companyLogo ? `<img src="${companyLogo}" alt="${companyName}" class="logo">` : ''}
        <h1 class="header-text">Invoice Ready</h1>
        <p class="header-subtitle">Payment Required - ${companyName}</p>
      </div>
    </div>
    
    <div class="content">
      <div class="greeting">Hi ${clientName || 'valued customer'},</div>
      
      <p class="intro-text">Thank you for your business! Your invoice is now ready for payment. Please review the details below and submit your payment at your earliest convenience.</p>
      
      <div class="invoice-card">
        <div class="invoice-badge">Payment Due</div>
        <div class="invoice-title">Service Invoice</div>
        <div class="invoice-number">Invoice #${invoiceNumber}</div>
        
        <div class="invoice-amounts">
          <div class="amount-item">
            <div class="amount-label">Total Amount</div>
            <div class="amount-value">$${total.toFixed(2)}</div>
          </div>
          <div class="amount-item">
            <div class="amount-label">Amount Due</div>
            <div class="amount-value amount-due">$${amountDue.toFixed(2)}</div>
          </div>
        </div>
        
        ${portalLink ? `
          <a href="${portalLink}" class="portal-button">
            View & Pay Online
          </a>
          <div class="features-list">
            <div class="feature-item">
              <span class="feature-icon">🔒</span>
              <span>Secure online payment</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📄</span>
              <span>Download PDF invoice</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📊</span>
              <span>View payment history</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📱</span>
              <span>Mobile-friendly portal</span>
            </div>
          </div>
        ` : `
          <a href="${invoiceLink}" class="portal-button">View Invoice</a>
        `}
      </div>
      
      ${amountDue > 0 ? `
        <div class="urgent-note">
          <strong>⚠️ Payment Required</strong>
          Please remit payment at your earliest convenience to avoid any service interruptions. We appreciate your prompt attention to this matter.
        </div>
      ` : ''}
      
      <div class="company-info-section">
        <div class="company-info-title">Contact ${companyName}</div>
        <div class="company-details">
          ${companyPhone ? `
            <div class="company-detail">
              <span class="company-detail-icon">📞</span>
              <a href="tel:${companyPhone}" style="color: #dc2626; text-decoration: none;">${companyPhone}</a>
            </div>
          ` : ''}
          ${companyEmail ? `
            <div class="company-detail">
              <span class="company-detail-icon">✉️</span>
              <a href="mailto:${companyEmail}" style="color: #dc2626; text-decoration: none;">${companyEmail}</a>
            </div>
          ` : ''}
          ${companyWebsite ? `
            <div class="company-detail">
              <span class="company-detail-icon">🌐</span>
              <a href="${companyWebsite}" style="color: #dc2626; text-decoration: none;">${companyWebsite}</a>
            </div>
          ` : ''}
        </div>
      </div>
      
      ${portalLink && invoiceLink ? `
        <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <strong>Alternative access:</strong><br>
          <a href="${invoiceLink}" style="color: #dc2626; word-break: break-all;">${invoiceLink}</a>
        </div>
      ` : ''}
      
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-top: 32px;">
        If you have any questions about this invoice or need to discuss payment arrangements, please don't hesitate to contact us. We're here to help and appreciate your business.
      </p>
      
      <p style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin-top: 24px;">
        Thank you for choosing ${companyName}!
      </p>
    </div>
    
    <div class="footer">
      <div class="footer-content">
        <div class="footer-logo">${companyName}</div>
        <div class="footer-text">
          Professional service you can trust. We're committed to delivering exceptional results and outstanding customer satisfaction.
        </div>
        ${companyPhone || companyEmail ? `
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
            ${companyPhone ? `<div style="margin: 8px 0;">📞 ${companyPhone}</div>` : ''}
            ${companyEmail ? `<div style="margin: 8px 0;">✉️ ${companyEmail}</div>` : ''}
          </div>
        ` : ''}
      </div>
    </div>
  </div>
</body>
</html>
  `;
}; 