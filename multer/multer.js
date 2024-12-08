const path =require ('path');
const multer =require ('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/'); // Directory to save uploaded images
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to the filename
    }
});

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')|| file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
  }
};
 const upload = multer({
  storage: storage,
  // limits: { fileSize: 5 * 1024 * 1024 },
}).fields([{ name: 'image_url', maxCount: 1 }, { name: 'additional_images', maxCount: 5 },{ name: 'categoryImage', maxCount: 1 }]);


// export const upload = multer({ storage: storage, fileFilter: imageFilter });

module.exports={upload}