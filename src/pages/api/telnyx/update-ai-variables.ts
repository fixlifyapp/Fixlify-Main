import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, variables } = req.body;

  try {
    // Call Supabase Edge Function which has access to Telnyx keys
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/update-telnyx-variables`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, variables }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update variables');
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating AI variables:', error);
    return res.status(500).json({ error: 'Failed to update variables' });
  }
}
