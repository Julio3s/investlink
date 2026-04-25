const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/misc';
    if (file.fieldname === 'pitch_deck') folder = 'uploads/pitchdecks';
    else if (file.fieldname === 'project_image') folder = 'uploads/projects';
    else if (file.fieldname === 'id_document') folder = 'uploads/kyc';
    else if (file.fieldname === 'selfie') folder = 'uploads/kyc';
    else if (file.fieldname === 'avatar') folder = 'uploads/avatars';
    ensureDir(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = {
    pitch_deck: ['.pdf'],
    id_document: ['.pdf', '.jpg', '.jpeg', '.png'],
    selfie: ['.jpg', '.jpeg', '.png'],
    project_image: ['.jpg', '.jpeg', '.png', '.webp'],
    avatar: ['.jpg', '.jpeg', '.png', '.webp'],
  };
  const ext = path.extname(file.originalname).toLowerCase();
  const allowed_exts = allowed[file.fieldname] || ['.pdf', '.jpg', '.jpeg', '.png'];
  if (allowed_exts.includes(ext)) cb(null, true);
  else cb(new Error(`Format non autorisé pour ${file.fieldname}`));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = upload;
