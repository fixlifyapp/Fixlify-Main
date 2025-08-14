import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, testNumber } = req.body;

  if (!testNumber) {
    return res.status(400).json({ error: 'Test phone number required' });
  }

  try {
    // Call Supabase Edge Function to initiate test call
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/test-ai-call`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, testNumber }),
      }
    );

    if (!response.ok) {
      return res.status(400).json({ error: 'Failed to initiate test call' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error initiating test call:', error);
    return res.status(500).json({ error: 'Failed to initiate test call' });
  }
}
