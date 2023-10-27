require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");

const app = express();

var corsOptions = {
  origin: "http://localhost:5000",
  optionsSuccessStatus: 200,
  cretentials: true,
};

//middlewares

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

//rutas
app.use("/user", require("./routes/users.routes"));
app.use("/api", require("./routes/upload.routes"));
app.use("/api", require("./routes/products.routes"));

//database
const URI = process.env.MONGODB_URL;
//mongoose.set("strictQuery", false); //para eliminar mensaje de alerta de mongo
//mongoose.connect(URI, {}, (err) => {
  //if (err) throw err;
  //console.log("Connected to mongoDB");
//});
mongoose.connect('mongodb+srv://MernPhotoUpload:Sanitas.2023@mernphotoupload.vfzvelt.mongodb.net/')
  .then(() => {
    console.log('Conexión exitosa a la base de datos');
  })
  .catch((err) => {
    console.error('Error al conectar a la base de datos:', err);
  });
  



//server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("server is running", PORT);
});