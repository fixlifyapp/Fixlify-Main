interface SendEmailParams {
  from: string;
  to: string;
  subject: string;
  html?: string;
  text?: string;
  customMessage?: string;
}

interface MailgunResponse {
  id: string;
  message: string;
}

export async function sendEmailViaMailgun(params: SendEmailParams): Promise<MailgunResponse> {
  const { from, to, subject, html, text, customMessage } = params;
  
  const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
  if (!mailgunApiKey) {
    console.error('send-invoice - Mailgun API key not found in environment variables');
    throw new Error('Mailgun API key not configured');
  }

  console.log('send-invoice - Sending email via Mailgun');
  console.log('send-invoice - FROM:', from);
  console.log('send-invoice - TO:', to);
  console.log('send-invoice - SUBJECT:', subject);

  const formData = new FormData();
  formData.append('from', from);
  formData.append('to', to);
  formData.append('subject', subject);
  
  if (customMessage) {
    formData.append('text', customMessage);
  } else {
    if (html) formData.append('html', html);
    if (text) formData.append('text', text);
  }
  
  formData.append('o:tracking', 'yes');
  formData.append('o:tracking-clicks', 'yes');
  formData.append('o:tracking-opens', 'yes');

  const mailgunUrl = 'https://api.mailgun.net/v3/fixlify.app/messages';
  const basicAuth = btoa(`api:${mailgunApiKey}`);

  const mailgunResponse = await fetch(mailgunUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`
    },
    body: formData
  });

  const responseText = await mailgunResponse.text();
  console.log('send-invoice - Mailgun response status:', mailgunResponse.status);
  console.log('send-invoice - Mailgun response body:', responseText);

  if (!mailgunResponse.ok) {
    console.error("send-invoice - Mailgun send error:", responseText);
    throw new Error(`Mailgun API error: ${mailgunResponse.status} - ${responseText}`);
  }

  let mailgunResult: MailgunResponse;
  try {
    mailgunResult = JSON.parse(responseText);
  } catch (parseError) {
    console.error('send-invoice - Error parsing Mailgun response:', parseError);
    throw new Error('Invalid response from Mailgun API');
  }

  console.log('send-invoice - Email sent successfully via Mailgun:', mailgunResult);
  
  return mailgunResult;
} 