// Available template variables for automations
export const automationVariables = {
  client: [
    { key: '{{client_name}}', label: 'Client Name', description: 'Full name of the client' },
    { key: '{{client_first_name}}', label: 'First Name', description: 'Client\'s first name' },
    { key: '{{client_last_name}}', label: 'Last Name', description: 'Client\'s last name' },
    { key: '{{client_email}}', label: 'Client Email', description: 'Client\'s email address' },
    { key: '{{client_phone}}', label: 'Client Phone', description: 'Client\'s phone number' },
    { key: '{{client_address}}', label: 'Client Address', description: 'Client\'s full address' },
  ],
  job: [
    { key: '{{job_title}}', label: 'Job Title', description: 'Title/description of the job' },
    { key: '{{job_status}}', label: 'Job Status', description: 'Current status of the job' },
    { key: '{{job_date}}', label: 'Job Date', description: 'Scheduled date of the job' },
    { key: '{{job_time}}', label: 'Job Time', description: 'Scheduled time of the job' },
    { key: '{{job_technician}}', label: 'Technician Name', description: 'Assigned technician' },
    { key: '{{job_service}}', label: 'Service Type', description: 'Type of service' },
    { key: '{{job_notes}}', label: 'Job Notes', description: 'Additional job notes' },
    { key: '{{job_id}}', label: 'Job ID', description: 'Unique job identifier' },
  ],
  invoice: [
    { key: '{{invoice_number}}', label: 'Invoice Number', description: 'Invoice number' },
    { key: '{{invoice_total}}', label: 'Invoice Total', description: 'Total amount due' },
    { key: '{{invoice_due_date}}', label: 'Due Date', description: 'Payment due date' },
    { key: '{{invoice_status}}', label: 'Invoice Status', description: 'Current invoice status' },
    { key: '{{payment_link}}', label: 'Payment Link', description: 'Link to pay online' },
  ],
  estimate: [
    { key: '{{estimate_number}}', label: 'Estimate Number', description: 'Estimate number' },
    { key: '{{estimate_total}}', label: 'Estimate Total', description: 'Total estimate amount' },
    { key: '{{estimate_valid_until}}', label: 'Valid Until', description: 'Estimate expiry date' },
    { key: '{{estimate_link}}', label: 'View Link', description: 'Link to view estimate' },
  ],
  company: [
    { key: '{{company_name}}', label: 'Company Name', description: 'Your company name' },
    { key: '{{company_phone}}', label: 'Company Phone', description: 'Company phone number' },
    { key: '{{company_email}}', label: 'Company Email', description: 'Company email address' },
    { key: '{{company_website}}', label: 'Website', description: 'Company website URL' },
    { key: '{{company_address}}', label: 'Company Address', description: 'Company address' },
  ],
  review: [
    { key: '{{review_link}}', label: 'Review Link', description: 'Link to leave a review' },
    { key: '{{google_review_link}}', label: 'Google Review', description: 'Google review link' },
    { key: '{{facebook_review_link}}', label: 'Facebook Review', description: 'Facebook review link' },
  ]
};