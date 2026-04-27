const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = {
    pitch_deck: ['.pdf'],
    id_document: ['.pdf', '.jpg', '.jpeg', '.png'],
    selfie: ['.jpg', '.jpeg', '.png'],
    project_image: ['.jpg', '.jpeg', '.png', '.webp'],
    avatar: ['.jpg', '.jpeg', '.png', '.webp'],
  };

  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = allowed[file.fieldname] || ['.pdf', '.jpg', '.jpeg', '.png'];
  if (allowedExts.includes(ext)) cb(null, true);
  else cb(new Error(`Format non autorise pour ${file.fieldname}`));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = upload;
