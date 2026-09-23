const fs = require('fs');
const path = require('path');

// Downloads an image from a remote URL (Pinterest, Google Images, etc.)
// and saves it into the local uploads/ folder, just like a Multer upload.
// Returns the local path to store in the DB, e.g. "/uploads/1699999999999.jpg"
const downloadImageFromUrl = async (imageUrl) => {
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

  return `/uploads/${filename}`;
};

module.exports = downloadImageFromUrl;