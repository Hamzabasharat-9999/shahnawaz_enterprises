import { randomUUID } from 'node:crypto';
import { ensureCloudinaryConfigured } from '../config/cloudinary.js';

const allowedFolders = new Set(['products', 'portfolio', 'company']);
const MAX_FILES = 8;

function uploadBuffer(cloudinary, file, folder) {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream({
      folder,
      public_id: randomUUID(),
      resource_type: 'image',
      overwrite: false,
      unique_filename: true,
      transformation: [
        { width: 2400, height: 2400, crop: 'limit' },
        { quality: 'auto:good', fetch_format: 'auto' }
      ],
      context: { alt: file.originalname.slice(0, 240) }
    }, (error, result) => {
      if (error) return reject(error);
      resolve({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        originalName: file.originalname
      });
    });
    upload.end(file.buffer);
  });
}

export async function uploadImages(req, res) {
  const cloudinary = ensureCloudinaryConfigured();
  const requestedFolder = String(req.body.folder || 'products').toLowerCase();
  if (!allowedFolders.has(requestedFolder)) {
    return res.status(400).json({ message: 'Choose a valid image folder.' });
  }
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ message: 'Select at least one image to upload.' });
  if (files.length > MAX_FILES) return res.status(400).json({ message: `Upload up to ${MAX_FILES} images at a time.` });

  const root = (process.env.CLOUDINARY_FOLDER || 'shahnawaz-enterprises').replace(/^\/+|\/+$/g, '');
  const folder = `${root}/${requestedFolder}`;
  const uploaded = [];
  try {
    for (const file of files) {
      const result = await uploadBuffer(cloudinary, file, folder);
      uploaded.push(result);
    }
    res.status(201).json({ message: `${uploaded.length} image${uploaded.length === 1 ? '' : 's'} uploaded successfully.`, items: uploaded });
  } catch (error) {
    // Already uploaded images remain in Cloudinary if a later upload fails; report those IDs
    // so the administrator can still use them rather than silently orphaning them.
    res.status(502).json({
      message: 'Cloud image upload failed. Check the Cloudinary configuration and try again.',
      uploaded
    });
  }
}

export async function getMediaStatus(req, res) {
  const configured = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
  res.json({ configured, provider: 'Cloudinary', maxFileSizeMB: 8, maxFilesPerUpload: MAX_FILES, allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] });
}
