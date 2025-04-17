const express = require("express");
const cors = require("cors");

require("./BACKEND/db/config");
const User = require("./BACKEND/db/User");
const Product = require("./BACKEND/db/Product");

const Jwt = require("jsonwebtoken");
const jwtKey = "e-comm"; //it is a secret key

const app = express();

app.use(express.json());
app.use(cors());

// Route to handle user registration
app.post("/register", async (req, res) => {
  let user = new User(req.body);
  let result = await user.save();
  result = result.toObject();
  delete result.password;
  Jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
    if (err) {
      res.send({ result: "Something went wrong" });
    } else {
      res.send({ result, auth: token });
    }
  });
});
//{
// "name":"Mittal",
// "email":"mittal@gmail.com",
// "password":"Mittal"
// }

app.post("/login", async (req, res) => {
  let user = await User.findOne(req.body).select("-password");
  if (req.body.email && req.body.password) {
    if (user) {
      Jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
          res.send("Something went wrong");
        } else {
          res.send({ user, auth: token });
        }
      });
    }
  }
});

app.post("/add-product", verifyToken,async (req, res) => {
  let product = new Product(req.body);
  let result = await product.save();
  res.send(result);
});

app.get("/products", verifyToken, async (req, resp) => {
  let products = await Product.find();
  if (products.length > 0) {
    resp.send(products);
  } else {
    resp.send({ result: "No products Found" });
  }
});

app.delete("/product/:id",verifyToken, async (req, resp) => {
  //  resp.send('working',req.params.id);
  const result = await Product.deleteOne({ _id: req.params.id });
  resp.send(result);
});

app.get("/product/:id",verifyToken, async (req, res) => {
  let result = await Product.findOne({ _id: req.params.id });
  if (result) {
    res.send(result);
  } else {
    res.send({ result: "NO result found" });
  }
});

app.put("/product/:id",verifyToken, async (req, res) => {
  let result = await Product.updateOne(
    { _id: req.params.id },
    {
      $set: req.body,
    }
  );
  res.send(result);
});

app.get("/search/:key", verifyToken, async (req, res) => {
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

function verifyToken(req, resp, next) {
  let token = req.headers["authorization"];
  if (token) {
    token = token.split(" ")[1];
    Jwt.verify(token, jwtKey, (err, valid) => {
      if (err) {
        resp.status(401).send({ message: "Invalid token" });
      } else {
        next();
      }
    });
  } else {
    resp.send({ result: "Please add token with header" });
    console.log("issue finding token");
  }
  
}

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
