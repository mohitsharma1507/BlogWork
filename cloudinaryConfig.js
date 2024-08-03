const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


cloudinary.config({
    cloud_name: "dgepdwzt0" ,
    api_key: 711379229351361,
    api_secret:"NUldIIyu9u18pRidHI1oPTuTPp8" ,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'wanderlust_DEV',
      allowerdformats: ["png","jpg","jpeg"],
    },
  });

module.exports ={
    cloudinary,
    storage,
}