// Beautiful 3D Email Templates for Estimates and Invoices
// With mobile responsiveness and portal links

export const create3DEstimateTemplate = (data: any) => {
  const {
    companyName,
    companyLogo,
    companyPhone,
    companyEmail,
    companyAddress,
    clientName,
    estimateNumber,
    total,
    portalLink,
    validUntil,
    lineItems = []
  } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Estimate from ${companyName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px 10px;
    }
    
    .wrapper {
      max-width: 600px;
      margin: 0 auto;
      perspective: 1000px;
    }
    
    .container {
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.15),
        0 0 0 1px rgba(255, 255, 255, 0.5) inset;
      transform-style: preserve-3d;
      transition: transform 0.3s ease;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(255, 255, 255, 0.05) 10px,
        rgba(255, 255, 255, 0.05) 20px
      );
      animation: shimmer 3s linear infinite;
    }
    
    @keyframes shimmer {
      0% { transform: translateX(-100%) translateY(-100%); }
      100% { transform: translateX(100%) translateY(100%); }
    }
    
    .logo {
      max-height: 80px;
      margin-bottom: 20px;
      position: relative;
      z-index: 2;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
    }
    
    .header h1 {
      color: #ffffff;
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 10px 0;
      position: relative;
      z-index: 2;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .header p {
      color: rgba(255, 255, 255, 0.9);
      font-size: 18px;
      position: relative;
      z-index: 2;
    }
    
    .content {
      padding: 40px 30px;
    }
    
    .greeting {
      font-size: 20px;
      color: #1f2937;
      margin-bottom: 20px;
      font-weight: 500;
    }
    
    .estimate-box {
      background: linear-gradient(135deg, #f8fafc 0%, #e5e7eb 100%);
      border-radius: 16px;
      padding: 30px;
      margin: 30px 0;
      border: 1px solid #e5e7eb;
      box-shadow: 
        0 10px 20px rgba(0, 0, 0, 0.05),
        0 0 0 1px rgba(255, 255, 255, 0.5) inset;
      position: relative;
      overflow: hidden;
    }
    
    .estimate-box::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
      background-size: 200% 100%;
      animation: gradient 2s ease infinite;
    }
    
    @keyframes gradient {
      0% { background-position: 0% 50%; }
      100% { background-position: 200% 50%; }
    }
    
    .estimate-number {
      font-size: 14px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    
    .total-amount {
      font-size: 36px;
      font-weight: 700;
      color: #1f2937;
      margin: 20px 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .valid-until {
      font-size: 14px;
      color: #6b7280;
      margin-top: 15px;
    }
    
    .cta-section {
      text-align: center;
      margin: 40px 0;
    }
    
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 18px 40px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 18px;
      box-shadow: 
        0 10px 25px rgba(102, 126, 234, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.2) inset;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .cta-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 
        0 15px 35px rgba(102, 126, 234, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.3) inset;
    }
    
    .cta-button:hover::before {
      left: 100%;
    }
    
    .info-section {
      background: #f8fafc;
      border-radius: 12px;
      padding: 25px;
      margin: 30px 0;
    }
    
    .info-title {
      font-size: 18px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 15px;
    }
    
    .info-list {
      list-style: none;
    }
    
    .info-list li {
      padding: 10px 0;
      color: #6b7280;
      display: flex;
      align-items: center;
    }
    
    .info-list li::before {
      content: '✓';
      color: #10b981;
      font-weight: bold;
      margin-right: 10px;
      font-size: 18px;
    }
    
    .footer {
      background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
      padding: 40px 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    
    .company-info {
      margin-bottom: 20px;
    }
    
    .company-info h3 {
      color: #1f2937;
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    
    .company-info p {
      color: #6b7280;
      font-size: 14px;
      line-height: 1.6;
      margin: 5px 0;
    }
    
    .social-links {
      margin-top: 20px;
    }
    
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #6b7280;
      text-decoration: none;
      transition: color 0.3s ease;
    }
    
    .social-links a:hover {
      color: #667eea;
    }
    
    .powered-by {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #9ca3af;
      font-size: 12px;
    }
    
    .powered-by a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }
    
    /* Mobile Responsive */
    @media (max-width: 600px) {
      body {
        padding: 10px 5px;
      }
      
      .header {
        padding: 30px 20px;
      }
      
      .header h1 {
        font-size: 24px;
      }
      
      .content {
        padding: 30px 20px;
      }
      
      .total-amount {
        font-size: 28px;
      }
      
      .cta-button {
        padding: 16px 32px;
        font-size: 16px;
      }
      
      .footer {
        padding: 30px 20px;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        ${companyLogo ? `<img src="${companyLogo}" alt="${companyName}" class="logo">` : ''}
        <h1>Your Estimate is Ready!</h1>
        <p>Professional Service Estimate</p>
      </div>
      
      <div class="content">
        <p class="greeting">Hi ${clientName || 'Valued Customer'} 👋</p>
        
        <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
          Thank you for considering ${companyName} for your service needs. We've prepared a detailed estimate for your review.
        </p>
        
        <div class="estimate-box">
          <div class="estimate-number">Estimate #${estimateNumber}</div>
          <div class="total-amount">$${total.toFixed(2)}</div>
          ${validUntil ? `<div class="valid-until">Valid until: ${validUntil}</div>` : ''}
        </div>
        
        <div class="cta-section">
          <a href="${portalLink}" class="cta-button">View Full Estimate Details</a>
          <p style="margin-top: 15px; color: #6b7280; font-size: 14px;">
            Click above to review line items, accept, or discuss changes
          </p>
        </div>
        
        <div class="info-section">
          <h3 class="info-title">What's Next?</h3>
          <ul class="info-list">
            <li>Review the detailed estimate in your client portal</li>
            <li>Accept the estimate online with one click</li>
            <li>Ask questions or request changes</li>
            <li>Schedule your service appointment</li>
          </ul>
        </div>
      </div>
      
      <div class="footer">
        <div class="company-info">
          <h3>${companyName}</h3>
          ${companyAddress ? `<p>${companyAddress}</p>` : ''}
          ${companyPhone ? `<p>📞 ${companyPhone}</p>` : ''}
          ${companyEmail ? `<p>✉️ ${companyEmail}</p>` : ''}
        </div>
        
        <div class="powered-by">
          Powered by <a href="https://fixlify.com">Fixlify</a> • Business Automation Platform
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;
};
export const create3DInvoiceTemplate = (data: any) => {
  const {
    companyName,
    companyLogo,
    companyPhone,
    companyEmail,
    companyAddress,
    clientName,
    invoiceNumber,
    total,
    amountDue,
    dueDate,
    portalLink,
    lineItems = []
  } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice from ${companyName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      min-height: 100vh;
      padding: 20px 10px;
    }
    
    .wrapper {
      max-width: 600px;
      margin: 0 auto;
      perspective: 1000px;
    }
    
    .container {
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.15),
        0 0 0 1px rgba(255, 255, 255, 0.5) inset;
      transform-style: preserve-3d;
      transition: transform 0.3s ease;
    }
    
    .header {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(255, 255, 255, 0.05) 10px,
        rgba(255, 255, 255, 0.05) 20px
      );
      animation: shimmer 3s linear infinite;
    }
    
    @keyframes shimmer {
      0% { transform: translateX(-100%) translateY(-100%); }
      100% { transform: translateX(100%) translateY(100%); }
    }
    
    .logo {
      max-height: 80px;
      margin-bottom: 20px;
      position: relative;
      z-index: 2;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
    }
    
    .header h1 {
      color: #ffffff;
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 10px 0;
      position: relative;
      z-index: 2;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .header p {
      color: rgba(255, 255, 255, 0.9);
      font-size: 18px;
      position: relative;
      z-index: 2;
    }
    
    .urgent-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
      padding: 8px 20px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: 600;
      margin-top: 15px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    .content {
      padding: 40px 30px;
    }
    
    .greeting {
      font-size: 20px;
      color: #1f2937;
      margin-bottom: 20px;
      font-weight: 500;
    }
    
    .invoice-box {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      border-radius: 16px;
      padding: 30px;
      margin: 30px 0;
      border: 2px solid #fecaca;
      box-shadow: 
        0 10px 20px rgba(239, 68, 68, 0.1),
        0 0 0 1px rgba(255, 255, 255, 0.5) inset;
      position: relative;
      overflow: hidden;
    }
    
    .invoice-box::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #ef4444, #dc2626, #ef4444);
      background-size: 200% 100%;
      animation: gradient 2s ease infinite;
    }
    
    @keyframes gradient {
      0% { background-position: 0% 50%; }
      100% { background-position: 200% 50%; }
    }
    
    .invoice-number {
      font-size: 14px;
      color: #991b1b;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
      font-weight: 600;
    }
    
    .total-amount {
      font-size: 36px;
      font-weight: 700;
      color: #dc2626;
      margin: 20px 0 10px 0;
    }
    
    .amount-due {
      font-size: 20px;
      color: #991b1b;
      font-weight: 600;
      margin-bottom: 15px;
    }
    
    .due-date {
      font-size: 16px;
      color: #dc2626;
      font-weight: 500;
      padding: 10px 20px;
      background: rgba(220, 38, 38, 0.1);
      border-radius: 8px;
      display: inline-block;
    }
    
    .cta-section {
      text-align: center;
      margin: 40px 0;
    }
    
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 18px 40px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 18px;
      box-shadow: 
        0 10px 25px rgba(239, 68, 68, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.2) inset;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .cta-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 
        0 15px 35px rgba(239, 68, 68, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.3) inset;
    }
    
    .cta-button:hover::before {
      left: 100%;
    }
    
    .secondary-button {
      display: inline-block;
      background: transparent;
      color: #dc2626;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 16px;
      border: 2px solid #dc2626;
      margin-top: 15px;
      transition: all 0.3s ease;
    }
    
    .secondary-button:hover {
      background: #dc2626;
      color: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(220, 38, 38, 0.2);
    }
    
    .payment-methods {
      background: #f8fafc;
      border-radius: 12px;
      padding: 25px;
      margin: 30px 0;
      text-align: center;
    }
    
    .payment-methods h3 {
      font-size: 18px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 15px;
    }
    
    .payment-icons {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-top: 15px;
      flex-wrap: wrap;
    }
    
    .payment-icon {
      width: 50px;
      height: 32px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #6b7280;
      font-weight: 500;
    }
    
    .info-section {
      background: #fef3c7;
      border-radius: 12px;
      padding: 20px;
      margin: 30px 0;
      border: 1px solid #fde68a;
    }
    
    .info-section p {
      color: #92400e;
      font-size: 14px;
      line-height: 1.6;
      margin: 0;
    }
    
    .footer {
      background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
      padding: 40px 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    
    .company-info {
      margin-bottom: 20px;
    }
    
    .company-info h3 {
      color: #1f2937;
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    
    .company-info p {
      color: #6b7280;
      font-size: 14px;
      line-height: 1.6;
      margin: 5px 0;
    }
    
    .powered-by {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #9ca3af;
      font-size: 12px;
    }
    
    .powered-by a {
      color: #ef4444;
      text-decoration: none;
      font-weight: 500;
    }
    
    /* Mobile Responsive */
    @media (max-width: 600px) {
      body {
        padding: 10px 5px;
      }
      
      .header {
        padding: 30px 20px;
      }
      
      .header h1 {
        font-size: 24px;
      }
      
      .content {
        padding: 30px 20px;
      }
      
      .total-amount {
        font-size: 28px;
      }
      
      .amount-due {
        font-size: 18px;
      }
      
      .cta-button {
        padding: 16px 32px;
        font-size: 16px;
      }
      
      .secondary-button {
        padding: 14px 28px;
        font-size: 14px;
      }
      
      .footer {
        padding: 30px 20px;
      }
      
      .payment-icons {
        gap: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        ${companyLogo ? `<img src="${companyLogo}" alt="${companyName}" class="logo">` : ''}
        <h1>Invoice Ready</h1>
        <p>Payment Due Soon</p>
        ${dueDate ? `<div class="urgent-badge">Due: ${dueDate}</div>` : ''}
      </div>
      
      <div class="content">
        <p class="greeting">Hi ${clientName || 'Valued Customer'} 👋</p>
        
        <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
          Thank you for choosing ${companyName}. Your invoice is ready for review and payment.
        </p>
        
        <div class="invoice-box">
          <div class="invoice-number">Invoice #${invoiceNumber}</div>
          <div class="total-amount">$${total.toFixed(2)}</div>
          ${amountDue && amountDue !== total ? `<div class="amount-due">Amount Due: $${amountDue.toFixed(2)}</div>` : ''}
          ${dueDate ? `<div class="due-date">Payment Due: ${dueDate}</div>` : ''}
        </div>
        
        <div class="cta-section">
          <a href="${portalLink}" class="cta-button">Pay Invoice Now</a>
          <br>
          <a href="${portalLink}" class="secondary-button">View Invoice Details</a>
          <p style="margin-top: 15px; color: #6b7280; font-size: 14px;">
            Secure payment portal • Multiple payment options available
          </p>
        </div>
        
        <div class="payment-methods">
          <h3>Accepted Payment Methods</h3>
          <div class="payment-icons">
            <div class="payment-icon">VISA</div>
            <div class="payment-icon">MC</div>
            <div class="payment-icon">AMEX</div>
            <div class="payment-icon">ACH</div>
            <div class="payment-icon">CHECK</div>
          </div>
        </div>
        
        <div class="info-section">
          <p>
            <strong>Need help?</strong> Reply to this email or call us at ${companyPhone || 'our office'}. 
            We're here to assist with any questions about your invoice or payment options.
          </p>
        </div>
      </div>
      
      <div class="footer">
        <div class="company-info">
          <h3>${companyName}</h3>
          ${companyAddress ? `<p>${companyAddress}</p>` : ''}
          ${companyPhone ? `<p>📞 ${companyPhone}</p>` : ''}
          ${companyEmail ? `<p>✉️ ${companyEmail}</p>` : ''}
        </div>
        
        <div class="powered-by">
          Powered by <a href="https://fixlify.com">Fixlify</a> • Business Automation Platform
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;
};