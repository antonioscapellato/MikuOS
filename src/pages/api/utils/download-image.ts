import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  try {
    // Fetch the image
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });

    // Get the content type from the response headers
    const contentType = response.headers['content-type'];
    
    // Determine filename from URL or use default
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    const filename = pathSegments[pathSegments.length - 1] || 'image';

    // Set appropriate headers for download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Send the image data
    res.send(Buffer.from(response.data, 'binary'));
  } catch (error) {
    console.error('Error downloading image:', error);
    res.status(500).json({ error: 'Failed to download image' });
  }
}
