export interface EmailTemplateData {
  subject?: string;
  email_content: string;
  action_button?: {
    text: string;
    url: string;
  };
  company: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    business_hours?: string;
    social?: {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
    };
  };
}

export function generateEmailHTML(data: EmailTemplateData): string {
  const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.subject || 'Fixlify Notification'}</title>
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
        /* Reset styles */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
        
        /* Remove default styling */
        body { margin: 0; padding: 0; width: 100% !important; min-width: 100%; }
        
        /* Mobile styles */
        @media only screen and (max-width: 600px) {
            .mobile-hide { display: none !important; }
            .mobile-center { text-align: center !important; }
            .container { width: 100% !important; max-width: 100% !important; }
            .content { width: 100% !important; padding: 20px !important; }
            .header-logo { width: 150px !important; height: auto !important; }
            .button { width: 100% !important; max-width: 300px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    
    <!-- Email Container -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f9fa;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                
                <!-- Main Content Container -->
                <table role="presentation" cellpadding="0" cellspacing="0" width="600" class="container" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); overflow: hidden;">
                    
                    <!-- Header with 3D Effect -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 40px 30px; text-align: center; position: relative;">
                            <!-- Logo -->
                            <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1); letter-spacing: -0.5px;">
                                FIXLIFY
                            </h1>
                            <p style="color: #e9d5ff; font-size: 14px; margin: 10px 0 0 0; font-weight: 500; letter-spacing: 2px; text-transform: uppercase;">
                                Field Service Management
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Email Content -->
                    <tr>
                        <td class="content" style="padding: 40px 40px 30px 40px;">
                            ${data.email_content}
                        </td>
                    </tr>
                    
                    ${data.action_button ? `
                    <!-- Call to Action Button -->
                    <tr>
                        <td align="center" style="padding: 0 40px 40px 40px;">
                            <table role="presentation" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);">
                                        <a href="${data.action_button.url}" target="_blank" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                                            ${data.action_button.text}
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    ` : ''}
                    
                    <!-- Divider -->
                    <tr>
                        <td style="padding: 0 40px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="border-top: 1px solid #e5e7eb; font-size: 0; line-height: 0;" height="1">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Company Info Footer with 3D Design -->
                    <tr>
                        <td style="padding: 40px; background-color: #fafafa;">
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(145deg, #ffffff, #f3f4f6); border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.08), inset 0 -3px 0 rgba(124, 58, 237, 0.1); padding: 30px;">
                                <tr>
                                    <td align="center">
                                        <!-- Company Name -->
                                        <h3 style="color: #1f2937; font-size: 20px; font-weight: 700; margin: 0 0 15px 0;">
                                            ${data.company.name}
                                        </h3>
                                        
                                        <!-- Company Details -->
                                        <table role="presentation" cellpadding="0" cellspacing="0">
                                            ${data.company.phone ? `
                                            <tr>
                                                <td style="color: #6b7280; font-size: 14px; padding: 5px 0;">
                                                    📞 ${data.company.phone}
                                                </td>
                                            </tr>
                                            ` : ''}
                                            
                                            ${data.company.email ? `
                                            <tr>
                                                <td style="color: #6b7280; font-size: 14px; padding: 5px 0;">
                                                    ✉️ ${data.company.email}
                                                </td>
                                            </tr>
                                            ` : ''}
                                            
                                            ${data.company.address ? `
                                            <tr>
                                                <td style="color: #6b7280; font-size: 14px; padding: 5px 0;">
                                                    📍 ${data.company.address}
                                                </td>
                                            </tr>
                                            ` : ''}
                                            
                                            ${data.company.website ? `
                                            <tr>
                                                <td style="padding: 15px 0 0 0;">
                                                    <a href="${data.company.website}" style="color: #7c3aed; text-decoration: none; font-weight: 500; font-size: 14px;">
                                                        Visit Our Website →
                                                    </a>
                                                </td>
                                            </tr>
                                            ` : ''}
                                        </table>
                                        
                                        ${data.company.business_hours ? `
                                        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                                            <tr>
                                                <td align="center">
                                                    <p style="color: #9ca3af; font-size: 12px; margin: 0; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                                                        Business Hours
                                                    </p>
                                                    <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">
                                                        ${data.company.business_hours}
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                        ` : ''}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f3f4f6; text-align: center;">
                            <p style="color: #9ca3af; font-size: 12px; margin: 0 0 10px 0;">
                                This email was sent by ${data.company.name} automated system.
                            </p>
                            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                © 2025 ${data.company.name}. All rights reserved.
                            </p>
                            
                            ${data.company.social ? `
                            <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 20px auto 0;">
                                <tr>
                                    ${data.company.social.facebook ? `
                                    <td style="padding: 0 10px;">
                                        <a href="${data.company.social.facebook}">
                                            <img src="https://img.icons8.com/ios-filled/50/7c3aed/facebook.png" width="24" height="24" alt="Facebook">
                                        </a>
                                    </td>
                                    ` : ''}
                                    ${data.company.social.instagram ? `
                                    <td style="padding: 0 10px;">
                                        <a href="${data.company.social.instagram}">
                                            <img src="https://img.icons8.com/ios-filled/50/7c3aed/instagram.png" width="24" height="24" alt="Instagram">
                                        </a>
                                    </td>
                                    ` : ''}
                                    ${data.company.social.linkedin ? `
                                    <td style="padding: 0 10px;">
                                        <a href="${data.company.social.linkedin}">
                                            <img src="https://img.icons8.com/ios-filled/50/7c3aed/linkedin.png" width="24" height="24" alt="LinkedIn">
                                        </a>
                                    </td>
                                    ` : ''}
                                </tr>
                            </table>
                            ` : ''}
                        </td>
                    </tr>
                </table>
                
                <!-- Powered by Fixlify -->
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                    <tr>
                        <td align="center">
                            <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                                Powered by <a href="https://fixlify.com" style="color: #7c3aed; text-decoration: none; font-weight: 500;">Fixlify</a>
                            </p>
                        </td>
                    </tr>
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>`;

  return template;
}

// Helper function to wrap simple content in our template
export function wrapInTemplate(content: string, subject: string, companyData: Partial<EmailTemplateData['company']>): string {
  const defaultCompany = {
    name: companyData.name || 'Fixlify',
    email: companyData.email,
    phone: companyData.phone,
    address: companyData.address,
    website: companyData.website,
    business_hours: companyData.business_hours,
    social: companyData.social
  };

  return generateEmailHTML({
    subject,
    email_content: content,
    company: defaultCompany
  });
}