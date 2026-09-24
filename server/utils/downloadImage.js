const fs = require('fs');
const path = require('path');

// If the URL is already an absolute https:// link (e.g. pasted by admin),
// skip downloading and store it directly — works perfectly on Vercel.
const isAbsoluteUrl = (url) =>
  url.startsWith('https://') || url.startsWith('http://');

// Resolve the public base URL for this server instance (same helper as productController)
const getServerBaseUrl = () => {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL.replace(/\/+$/, '');
  if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL.replace(/\/+$/, '');
  return `http://localhost:${process.env.PORT || 8000}`;
};

// Downloads an image from a remote URL and saves it to uploads/.
// Returns a full absolute URL so the image is reachable from anywhere.
const downloadImageFromUrl = async (imageUrl) => {
  // If admin pasted a direct https:// image link, store it as-is — no download needed.
  if (isAbsoluteUrl(imageUrl)) {
    // Verify it actually serves an image before trusting it
    try {
      const head = await fetch(imageUrl, { method: 'HEAD' });
      const ct = head.headers.get('content-type') || '';
      if (ct.startsWith('image/')) return imageUrl;
    } catch {
      // fall through and try downloading anyway
    }
  }

  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error('Could not fetch image from the provided URL.');
  }

  const contentType = response.headers.get('content-type') || '';

  if (!contentType.startsWith('image/')) {
    throw new Error('The provided URL does not point to a valid image.');
  }

  // Work out a reasonable file extension
  const extFromType = contentType.split('/')[1]?.split(';')[0];
  const allowedExt = ['jpeg', 'jpg', 'png', 'webp'];
  const ext = allowedExt.includes(extFromType) ? extFromType : 'jpg';

  const filename = `${Date.now()}.${ext}`;
  const uploadsDir = path.join(__dirname, '..', 'uploads');

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = path.join(uploadsDir, filename);
  const buffer = Buffer.from(await response.arrayBuffer());

  fs.writeFileSync(filePath, buffer);

  // Return a full absolute URL so it works on Vercel and any other host
  return `${getServerBaseUrl()}/uploads/${filename}`;
};

module.exports = downloadImageFromUrl;