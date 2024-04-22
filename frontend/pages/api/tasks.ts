import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
    name: string
}  

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (req.method === 'GET') {
      // Handle GET request for tasks
      res.status(200).json({ name: 'GET tasks' });
    } else if (req.method === 'POST') {
      // Handle POST request for tasks
      res.status(200).json({ name: 'POST tasks' });
    } else {
      res.status(405).end(); // Method Not Allowed
    }
}