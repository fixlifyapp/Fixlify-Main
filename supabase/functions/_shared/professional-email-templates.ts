// Professional Email Templates for Estimates and Invoices
// Clean, modern design that works in all email clients

export const createProfessionalEstimateTemplate = (data: any) => {
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
    validUntil
  } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Estimate from ${companyName}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .content { padding: 20px !important; }
      .button { padding: 12px 24px !important; font-size: 16px !important; }
      .header { padding: 30px 20px !important; }
      h1 { font-size: 24px !important; }
      .amount { font-size: 32px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table class="container" role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td class="header" style="background-color: #5B21B6; padding: 40px 30px; text-align: center;">
              ${companyLogo ? `
                <img src="${companyLogo}" alt="${companyName}" style="max-height: 60px; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;">
              ` : ''}
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 600; margin: 0 0 10px 0;">Estimate Ready</h1>
              <p style="color: #E9D5FF; font-size: 16px; margin: 0;">Professional Service Estimate</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content" style="padding: 40px 30px;">
              <p style="font-size: 18px; color: #1F2937; margin: 0 0 20px 0;">Hi ${clientName || 'Valued Customer'} 👋</p>
              
              <p style="color: #4B5563; line-height: 1.6; margin: 0 0 30px 0;">
                Thank you for considering ${companyName} for your service needs. We've prepared a detailed estimate for your review.
              </p>
              
              <!-- Estimate Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F3F4F6; border-radius: 8px; margin: 0 0 30px 0;">
                <tr>
                  <td style="padding: 30px; text-align: center;">
                    <p style="color: #6B7280; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
                      ESTIMATE #${estimateNumber}
                    </p>
                    <p class="amount" style="color: #5B21B6; font-size: 36px; font-weight: 700; margin: 0 0 10px 0;">
                      $${total.toFixed(2)}
                    </p>
                    ${validUntil ? `
                      <p style="color: #6B7280; font-size: 14px; margin: 0;">
                        Valid until: ${validUntil}
                      </p>
                    ` : ''}
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 0 0 20px 0;">
                    <a href="${portalLink}" class="button" style="display: inline-block; background-color: #5B21B6; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 18px;">
                      View Full Estimate
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="text-align: center; color: #6B7280; font-size: 14px; margin: 0 0 30px 0;">
                Click above to review line items, accept, or request changes
              </p>
              
              <!-- What's Next -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB; border-radius: 8px;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="color: #1F2937; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">What's Next?</h3>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #10B981; font-weight: bold; margin-right: 10px;">✓</span>
                          <span style="color: #4B5563;">Review the detailed estimate online</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #10B981; font-weight: bold; margin-right: 10px;">✓</span>
                          <span style="color: #4B5563;">Accept with one click</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #10B981; font-weight: bold; margin-right: 10px;">✓</span>
                          <span style="color: #4B5563;">Ask questions or request changes</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 40px 30px; text-align: center; border-top: 1px solid #E5E7EB;">
              <h3 style="color: #1F2937; font-size: 20px; font-weight: 600; margin: 0 0 15px 0;">${companyName}</h3>
              ${companyAddress ? `<p style="color: #6B7280; font-size: 14px; margin: 0 0 5px 0;">${companyAddress}</p>` : ''}
              ${companyPhone ? `<p style="color: #6B7280; font-size: 14px; margin: 0 0 5px 0;">📞 ${companyPhone}</p>` : ''}
              ${companyEmail ? `<p style="color: #6B7280; font-size: 14px; margin: 0 0 20px 0;">✉️ ${companyEmail}</p>` : ''}
              
              <p style="color: #9CA3AF; font-size: 12px; margin: 20px 0 0 0; padding-top: 20px; border-top: 1px solid #E5E7EB;">
                Powered by <a href="https://fixlify.com" style="color: #5B21B6; text-decoration: none;">Fixlify</a> • Business Automation Platform
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};
export const createProfessionalInvoiceTemplate = (data: any) => {
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
    portalLink
  } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice from ${companyName}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .content { padding: 20px !important; }
      .button { padding: 12px 24px !important; font-size: 16px !important; }
      .header { padding: 30px 20px !important; }
      h1 { font-size: 24px !important; }
      .amount { font-size: 32px !important; }
      .payment-icons { flex-wrap: wrap !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table class="container" role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td class="header" style="background-color: #DC2626; padding: 40px 30px; text-align: center;">
              ${companyLogo ? `
                <img src="${companyLogo}" alt="${companyName}" style="max-height: 60px; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;">
              ` : ''}
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 600; margin: 0 0 10px 0;">Invoice Ready</h1>
              <p style="color: #FEE2E2; font-size: 16px; margin: 0;">Payment Due Soon</p>
              ${dueDate ? `
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 20px auto 0;">
                  <tr>
                    <td style="background-color: rgba(255,255,255,0.2); color: #ffffff; padding: 8px 20px; border-radius: 25px; font-size: 14px; font-weight: 600;">
                      Due: ${dueDate}
                    </td>
                  </tr>
                </table>
              ` : ''}
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content" style="padding: 40px 30px;">
              <p style="font-size: 18px; color: #1F2937; margin: 0 0 20px 0;">Hi ${clientName || 'Valued Customer'} 👋</p>
              
              <p style="color: #4B5563; line-height: 1.6; margin: 0 0 30px 0;">
                Thank you for choosing ${companyName}. Your invoice is ready for review and payment.
              </p>
              
              <!-- Invoice Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FEF2F2; border: 2px solid #FECACA; border-radius: 8px; margin: 0 0 30px 0;">
                <tr>
                  <td style="padding: 30px; text-align: center;">
                    <p style="color: #991B1B; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                      INVOICE #${invoiceNumber}
                    </p>
                    <p class="amount" style="color: #DC2626; font-size: 36px; font-weight: 700; margin: 0 0 10px 0;">
                      $${total.toFixed(2)}
                    </p>
                    ${amountDue && amountDue !== total ? `
                      <p style="color: #991B1B; font-size: 18px; font-weight: 600; margin: 0 0 10px 0;">
                        Amount Due: $${amountDue.toFixed(2)}
                      </p>
                    ` : ''}
                    ${dueDate ? `
                      <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 15px auto 0;">
                        <tr>
                          <td style="background-color: rgba(220, 38, 38, 0.1); color: #DC2626; padding: 10px 20px; border-radius: 8px; font-size: 16px; font-weight: 500;">
                            Payment Due: ${dueDate}
                          </td>
                        </tr>
                      </table>
                    ` : ''}
                  </td>
                </tr>
              </table>
              
              <!-- CTA Buttons -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 0 0 15px 0;">
                    <a href="${portalLink}" class="button" style="display: inline-block; background-color: #DC2626; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 18px;">
                      Pay Invoice Now
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 0 0 20px 0;">
                    <a href="${portalLink}" style="display: inline-block; background-color: transparent; color: #DC2626; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; border: 2px solid #DC2626;">
                      View Invoice Details
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="text-align: center; color: #6B7280; font-size: 14px; margin: 0 0 30px 0;">
                Secure payment portal • Multiple payment options available
              </p>
              
              <!-- Payment Methods -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB; border-radius: 8px; margin: 0 0 30px 0;">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <h3 style="color: #1F2937; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">Accepted Payment Methods</h3>
                    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                      <tr>
                        <td style="padding: 0 5px;">
                          <div style="display: inline-block; background-color: #ffffff; border: 1px solid #E5E7EB; border-radius: 6px; padding: 8px 12px; font-size: 12px; color: #6B7280; font-weight: 500;">VISA</div>
                        </td>
                        <td style="padding: 0 5px;">
                          <div style="display: inline-block; background-color: #ffffff; border: 1px solid #E5E7EB; border-radius: 6px; padding: 8px 12px; font-size: 12px; color: #6B7280; font-weight: 500;">MC</div>
                        </td>
                        <td style="padding: 0 5px;">
                          <div style="display: inline-block; background-color: #ffffff; border: 1px solid #E5E7EB; border-radius: 6px; padding: 8px 12px; font-size: 12px; color: #6B7280; font-weight: 500;">AMEX</div>
                        </td>
                        <td style="padding: 0 5px;">
                          <div style="display: inline-block; background-color: #ffffff; border: 1px solid #E5E7EB; border-radius: 6px; padding: 8px 12px; font-size: 12px; color: #6B7280; font-weight: 500;">ACH</div>
                        </td>
                        <td style="padding: 0 5px;">
                          <div style="display: inline-block; background-color: #ffffff; border: 1px solid #E5E7EB; border-radius: 6px; padding: 8px 12px; font-size: 12px; color: #6B7280; font-weight: 500;">CHECK</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Help Section -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FEF3C7; border: 1px solid #FDE68A; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #92400E; font-size: 14px; line-height: 1.6; margin: 0;">
                      <strong>Need help?</strong> Reply to this email or call us at ${companyPhone || '+12898192158'}. We're here to assist with any questions about your invoice or payment options.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 40px 30px; text-align: center; border-top: 1px solid #E5E7EB;">
              <h3 style="color: #1F2937; font-size: 20px; font-weight: 600; margin: 0 0 15px 0;">${companyName}</h3>
              ${companyAddress ? `<p style="color: #6B7280; font-size: 14px; margin: 0 0 5px 0;">${companyAddress}</p>` : ''}
              ${companyPhone ? `<p style="color: #6B7280; font-size: 14px; margin: 0 0 5px 0;">📞 ${companyPhone}</p>` : ''}
              ${companyEmail ? `<p style="color: #6B7280; font-size: 14px; margin: 0 0 20px 0;">✉️ ${companyEmail}</p>` : ''}
              
              <p style="color: #9CA3AF; font-size: 12px; margin: 20px 0 0 0; padding-top: 20px; border-top: 1px solid #E5E7EB;">
                Powered by <a href="https://fixlify.com" style="color: #DC2626; text-decoration: none;">Fixlify</a> • Business Automation Platform
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};