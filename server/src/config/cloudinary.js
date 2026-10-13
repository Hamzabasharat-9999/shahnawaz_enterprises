import { v2 as cloudinary } from 'cloudinary';

const configured = () => Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

export function ensureCloudinaryConfigured() {
  if (!configured()) {
    const error = new Error('Image uploads are not configured yet. Add the Cloudinary credentials to server/.env.');
    error.statusCode = 503;
    throw error;
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  return cloudinary;
}

export default cloudinary;
