import type { NextApiRequest, NextApiResponse } from 'next';
import { generateFounderBrief } from '@/core/engine/generateFounderBrief';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const brief = await generateFounderBrief();
    res.status(200).json(brief);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate brief' });
  }
}
