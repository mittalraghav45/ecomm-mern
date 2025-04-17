const express = require("express");
const cors = require("cors");

require("./BACKEND/db/config");
const User = require("./BACKEND/db/User");
const Product = require("./BACKEND/db/Product");

const JWT = require('jsonwebtoken');
const jwtKey='e-comm'; //it is a secret key


const app = express();

app.use(express.json());
app.use(cors());

// Route to handle user registration
app.post("/register", async (req, res) => {
  try {
    let user = new User(req.body);
    let result = await user.save();
    res.status(201).send({ result });
  } catch (err) {
    res
      .status(500)
      .send({ error: "Registration failed", message: err.message });
  }
});

app.post("/login", async (req, res) => {
  let user = await User.findOne(req.body).select("-password");
  if (req.body.email && req.body.password) {
    if (user) {
      res.status(200).json({ user });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  }
});

app.post("/add-product", async (req, res) => {
  let product = new Product(req.body);
  let result = await product.save();
  res.send(result);
});

app.get("/products", async (req, resp) => {
  let products = await Product.find();
  if (products.length > 0) {
    resp.send(products);
  } else {
    resp.send({ result: "No products Found" });
  }
});

app.delete("/product/:id", async (req, resp) => {
  //  resp.send('working',req.params.id);
  const result = await Product.deleteOne({ _id: req.params.id });
  resp.send(result);
});

app.get("/product/:id", async (req, res) => {
  let result = await Product.findOne({ _id: req.params.id });
  if (result) {
    res.send(result);
  } else {
    res.send({ result: "NO result found" });
  }
});

app.put("/product/:id", async (req, res) => {
  let result = await Product.updateOne(
    { _id: req.params.id },
    {
      $set: req.body,
    }
  );
  res.send(result);
});

app.get("/search/:key", async (req, res) => {
  let result = await Product.find({
    $or: [
      {
        name: { $regex: req.params.key },
        category: { $regex: req.params.key },
        price: { $regex: req.params.key },
      },
    ],
  });

  res.send(result);
});

// Start the server on port 5000
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
