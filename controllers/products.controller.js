const Products = require("../models/Product");

class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort().split(",").join("");
      this.query = this.query.sort(sortBy);
    }
    {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }
}

const productCtrl = {
  getProducts: async (req, res) => {
    try {
      const features = new APIfeatures(Products.find(), req.query).sorting();
      const products = await features.query;
      res.json({
        status: "success",
        resutl: products.length,
        products: products,
      });
    } catch (err) {}
  },

  createProduct: async (req, res) => {
    try {
      const { product_id, title, price, description, content, images } =
        req.body;
      if (!images)
        return res.status(400).json({ msg: "sin imagen seleccionada" });
      const product = await Products.findOne({ product_id });
      if (product)
        return res.status(400).json({ msg: "este producto ya existe" });
      const newProduct = new Products({
        product_id,
        title: title.toLowerCase(),
        price,
        description,
        content,
        images,
      });
      await newProduct.save();
      res.json({ msg: "producto creado" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      await Products.findByIdAndDelete(req.params.id);
      res.json({ msg: "Producto Eliminado" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const { title, price, description, content, images } = req.body;
      if (!images) return res.status(400).json({ msg: "no hay imagen" });

      await Products.findByIdAndUpdate(
        { _id: req.params.id },
        {
          title: title.toLowerCase(),
          price,
          description,
          content,
          images,
        }
      );
      res.json({ msg: "Producto actualizado" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = productCtrl;