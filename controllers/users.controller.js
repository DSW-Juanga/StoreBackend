const Users = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userCtrl = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const user = await Users.findOne({ email });
      if (user) return res.status(400).json({ msg: "el mail ya existe" });

      if (password.length < 6)
        return res.status(400).json({ msg: "minimo 6 caracteres" });
      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = new Users({
        name,
        email,
        password: passwordHash,
      });
      await newUser.save();
     
      const accesstoken = createAccessToken({ id: newUser._id });
      const refreshtoken = createRefreshToken({ id: newUser._id });
      res.cookie("refreshtoken", refreshtoken, {
        httpOnly: true,
        path: "/user/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000, 
      });

       res.json({ accesstoken }); 
      /* res.json({msg: "register success!"}) */
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await Users.findOne({ email });
      if (!user) return res.status(400).json({ msg: "el usuario no existe" });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: "password incorrecto" });

      //sí es correcto el login
      const accesstoken = createAccessToken({ id: user._id });
      const refreshtoken = createRefreshToken({ id: user._id });
      res.cookie("refreshtoken", refreshtoken, {
        httpOnly: true,
        path: "/user/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.json({accesstoken});
       //res.json({msg: "login success!"}) 
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    } 
    
  },
  logout: async (req, res) => {
    try {
      res.clearCookie("refreshtoken", { path: "/user/refresh_token" });
      return res.json({ msg: "logged out" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  refreshtoken: (req, res) => {
    try {
      const rf_token = req.cookies.refreshtoken;
      if (!rf_token)
        return res.status(400).json({ msg: "please login o register" });
      jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err)
          return res.status(400).json({ msg: "please login o register" });

        const accesstoken = createAccessToken({ id: user.id });
        res.json({ accesstoken });
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getUser: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select("-password");
      if (!user) return res.status(400).json({ msg: " el usuario no existe" });
      res.json(user);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

const createAccessToken = (user) =>{
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "11m"})
}
const createRefreshToken = (user) =>{
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "11m"})
}

module.exports = userCtrl;