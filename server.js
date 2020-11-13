const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const passport = require("passport");
const http = require("http");
const flash = require("connect-flash");
const session = require("express-session");
const multer = require("multer");
const Users = require("./api/models/users.js");
const Shops = require("./api/models/shops.js");
const Invoices = require("./api/models/invoices.js");
const fs = require("fs");
const pdf = require("pdf-creator-node");
const path = require("path");
const app = express();

try {
  mongoose.connect(`mongodb://localhost:27017/invoiceCentral`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("connected");
} catch (err) {
  console.log(err);
}

const server = http.createServer(app);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(flash());
const users = [];

const initializePassport = require("./passport_config.js");
initializePassport(
  passport,
  async (username) =>
    // getUserByUsername
    await Users.find({ username }).exec(),
  // getUserById
  async (id) => await Users.findById(id).exec()
);

app.use(
  session({
    // key to encrpt
    secret: "secret",
    // resave existing sesson id
    resave: false,
    // save empty session id
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views/"));
var upload = multer({ dest: "uploads/" });

// localhosh:3000/login
app.get("/", checkAuth, async (req, res) => {
  console.log("index");
  const shop = await Invoices.find({ shop: req.user.username });
  const client = await Invoices.find({
    client: [{ type: "invoiceCentral", username: req.user.username }],
  });
  console.log(shop);
  console.log(client);
  await res.render("index.ejs", { user: req.user, shop, client });
});

app.get("/login", checkNotAuth, (req, res) => {
  res.sendFile("/views/html/login.html", { root: __dirname });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    const user = { name: username };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN);
    res.json({ accessToken });
  }
);

app.get("/signup", checkNotAuth, (req, res) => {
  res.sendFile("/views/html/signup.html", { root: __dirname });
});

app.post("/signup", checkNotAuth, upload.single("avatar"), async (req, res) => {
  try {
    const hashedPasswd = await bcrypt.hash(req.body.password, 10);
    let image = "";
    if (req.hasOwnProperty("file")) {
      image = fs.readFileSync(
        path.join(__dirname + "/uploads/" + req.file.filename)
      );
    }
    var data = { ...req.body, password: hashedPasswd };
    delete data["signup"];

    data["images"] = {};
    data["images"]["data"] = image;

    var user = await Users.create(data);

    res.redirect("/login");
  } catch (err) {
    console.log(err);
    res.redirect("/signup");
  }
});
app.get("/products/add", checkAuth, async (req, res) => {
  res.sendFile("/views/html/add_products.html", { root: __dirname });
});

app.post("/products/add", checkAuth, async (req, res) => {
  const data = req.body;
  try {
    var shop = await Shops.Shop.find({ username: data.username }).exec();
    if (Object.keys(shop).length > 0) {
      var product = await Shops.Product.create(data);
      await Shops.Shop.updateOne(
        { username: data.username },
        { $push: { products: product._id } }
      );
      res.status(200).send({ status: "success" });
    } else {
      res.status(302).send({ status: "error" });
    }
  } catch (err) {
    console.log(err);
    res.status(302).send({ status: "error" });
  }
});

app.get("/shop/register", checkAuth, async (req, res) => {
  res.sendFile("/views/html/register_shop.html", { root: __dirname });
});

app.post("/shop/register", checkAuth, async (req, res) => {
  const data = req.body;
  try {
    var shop = await Shops.Shop.create(data);
    await Users.updateOne(
      { username: data.username },
      { $set: { shop: "registered" } }
    );
    console.log(shop);
    res.status(200).send({ status: "success" });
  } catch (err) {
    console.log(err);
    res.status(302).send({ status: "error" });
  }
});

app.get("/shop/register", checkAuth, async (req, res) => {
  res.sendFile("/views/html/shop_details.html", { root: __dirname });
});

app.post("/shop/register", checkAuth, async (req, res) => {
  const data = req.body;
  try {
    var shop = await Shops.Shop.create(data);
    await Users.updateOne(
      { username: data.username },
      { $set: { shop: "registered" } }
    );
    console.log(shop);
    res.status(200).send({ status: "success" });
  } catch (err) {
    console.log(err);
    res.status(302).send({ status: "error" });
  }
});

app.get("/invoice", checkAuth, async (req, res) => {
  res.sendFile("/views/html/invoice.html", { root: __dirname });
});

app.post("/invoice", checkAuth, async (req, res) => {
  try {
    var invoice = await Invoices.create(req.body);
    console.log(invoice);
    for (i of req.body.items) {
      var p = await Shops.Product.find({ productId: i });
      var quantity = parseInt(p[0].quantity) - parseInt(invoice.quantity[i]);
      await Shops.Product.updateOne(
        { productId: i },
        { $set: { quantity: quantity } }
      );
    }
    const data = await generatePdf(invoice);
    res.send(data);
  } catch (err) {
    console.log(err);
    res.status(302).send({ status: "error" });
  }
});

app.get("/invoice/:invoiceId", checkAuth, (req, res) => {
  const { invoiceId } = req.params;
  res.sendFile(`/uploads/invoices/${invoiceId}.pdf`, { root: __dirname });
});
app.get("/products/search/:shopId", checkAuth, async (req, res) => {
  try {
    const { shopId } = req.params;
    const key = Object.keys(req.query)[0];
    const queryVal = "^" + req.query[key] + ".*";
    console.log(shopId);
    const pipeline1 = [{ $match: { username: shopId } }];
    var getProductsId = await Shops.Shop.aggregate(pipeline1);
    const pipeline2 = [
      { $match: { _id: { $in: [...getProductsId[0].products] } } },
      { $match: { [key]: { $regex: queryVal, $options: "i" } } },
    ];
    var getProducts = await Shops.Product.aggregate(pipeline2);
    res.send(getProducts);
  } catch (err) {
    console.log(err);
    res.status(302).send({ status: "error" });
  }
});

app.delete("/login", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

async function generatePdf(invoice) {
  const pipeShop = [
    { $match: { _id: invoice._id } },
    {
      $lookup: {
        from: "shops",
        localField: "shop",
        foreignField: "username",
        as: "shop",
      },
    },
  ];
  var pipeClient = [];
  if (invoice.client[0].type !== "local") {
    pipeClient = [
      {
        $lookup: {
          from: "users",
          localField: "client.username",
          foreignField: "username",
          as: "client",
        },
      },
    ];
  }
  const pipeProduct = [
    {
      $lookup: {
        from: "products",
        localField: "items",
        foreignField: "productId",
        as: "items",
      },
    },
  ];

  const [data] = await Invoices.aggregate([
    ...pipeShop,
    ...pipeClient,
    ...pipeProduct,
  ]);
  var grandTotal = 0;
  data.items.forEach((x, i) => {
    data.items[i].quantity = data.quantity[x.productId];
    data.items[i].sellingPrice = Math.floor(
      (parseFloat(x.mrp) *
        parseFloat(data.items[i].quantity) *
        (100 - parseFloat(x.discount))) /
        100
    );
    grandTotal += data.items[i].sellingPrice;
  });
  data.grandTotal = grandTotal;
  delete data.quantity;
  console.log(data.client);
  var html = fs.readFileSync("./views/html/template.html", "utf8");

  var options = {
    format: "A3",
    orientation: "portrait",
    border: "10mm",
    footer: {
      height: "28mm",
      contents: {
        first: "Cover page",
        2: "Second page", // Any page number is working. 1-based index
        default:
          '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
        last: "Last Page",
      },
    },
  };

  var document = {
    html: html,
    data: {
      invoice: data,
    },
    path: `./uploads/invoices/${data._id}.pdf`,
  };

  await pdf
    .create(document, options)
    .then((res) => {
      console.log(res);
    })
    .catch((error) => {
      console.error(error);
    });
  return { invoiceId: data._id };
}

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    console.log("check Auth");
    next();
  } else {
    return res.redirect("/login");
  }
}

function checkNotAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

server.listen(3000);
