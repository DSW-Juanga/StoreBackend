const router = require("express").Router();
//const cloudinary = require("cloudinary");
const cloudinary = require('cloudinary').v2;
const auth = require("../middlewares/auth");
const authAdmin = require("../middlewares/authAdmin");
const fs = require("fs");







cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  }); 

//upload image only admin can use
router.post("/upload",auth, authAdmin, (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0)
      return res.status(400).json({ msg: "Selecciona una imagen" });
    const file = req.files.file;
    if (file.size > 1024 * 1024) {
      removeTmp(file.tempFilePath);
      return res.status(400).json({ msg: "Tamaño demasiado grande" });
    } 

    if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
      removeTmp(file.tempFilePath);
      return res.status(400).json({ msg: "Formato incorrecto" });
    }
 
    // Importa la biblioteca de Cloudinary


          
    


// Ahora puedes utilizar Cloudinary para cargar, recuperar o manipular recursos multimedia

// Ejemplo: Subir un archivo a Cloudinary
cloudinary.uploader.upload(file.tempFilePath, { folder: 'MernPhotoUpload' }, (err, result) => {
  if (err) {
    console.error('Error al cargar el archivo a Cloudinary:', err);
  } else {
    console.log('Archivo subido exitosamente:', result);
  }

  removeTmp(file.tempFilePath);

           res.json({ public_id: result.public_id, url: result.secure_url }); 
         /* res.json({ msg: "Imagen cargada"}); */

      }
    );
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

//Delete image
router.post("/destroy", (req, res) => {
  try {
    const { public_id } = req.body;
    if (!public_id) return res.status(400).json({ msg: "Seleccionar Imagen" });
    cloudinary.uploader.destroy(public_id, async (err, result) => {
      if (err) throw err;
      res.json({ msg: "Deleted Image" });
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

const removeTmp = (path) => {
  fs.unlink(path, (err) => {
    if (err) throw err;
  });
};

module.exports = router;