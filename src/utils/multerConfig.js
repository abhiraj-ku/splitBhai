const path = require('path');
const fs = require('fs');

const proofsDir = path.join(__dirname, `../../debtor-proofs`);
if (!fs.existsSync(proofsDir)) {
  fs.mkdirSync(proofsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, proofsDir);
  },
  filename: function (req, res, file) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// setup multer

const upload = multer({
  storage: storage,
  limits: 10 * 1024 * 1024, // 10 mb limit
  fileFilter: function (req, res, cb) {
    const fileTypes = /jpg|jpeg|png|pdf/;
    const mimetype = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname).toLocaleLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed!'));
    }
  },
});

module.exports = upload;
