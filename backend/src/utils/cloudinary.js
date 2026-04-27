const cloudinary = require('cloudinary').v2;

let configured = false;

const ensureCloudinary = () => {
  if (configured) return;

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary is not configured');
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });

  configured = true;
};

const uploadBuffer = async (file, options = {}) => {
  if (!file?.buffer) return null;
  ensureCloudinary();

  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: options.folder || 'investlink/misc',
    resource_type: options.resourceType || 'auto',
    public_id: options.publicId,
    overwrite: false,
  });

  return result.secure_url;
};

module.exports = { uploadBuffer };
