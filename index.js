require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const mongoose = require("mongoose");
const urlparser = require("url");

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// console.log(mongoose.connection.readyState)

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(`${process.cwd()}/public`));

// Mongoose database schema
let UrlSchema = new mongoose.Schema({
  url: String,
  shorturl: Number,
});
const Url = mongoose.model("Url", UrlSchema);

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// POST /api/shorturl
app.post("/api/shorturl", (req, res) => {
  const bodyurl = req.body.url;
  console.log(bodyurl);
  const checkaddress = dns.lookup(urlparser.parse(bodyurl).hostname, (err, address, family) => {
    console.log("address: %j family: IPv%s", address, family);
    if (!address) {
      res.json({ error: "invalid url" });
    } else {
      let shortUrl = Math.floor(Math.random() * 100000);
      console.log(shortUrl);
      const url = new Url({ url: bodyurl, shorturl: shortUrl });
      url
        .save()
        .then((result) => {
          res.json({ original_url: result.url, short_url: result.shorturl });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
});

// GET /api/shorturl/:shorturl
app.get("/api/shorturl/:shorturl", (req, res) => {
  const shorturl = req.params.shorturl;
  console.log(shorturl);
  Url.findOne({ shorturl: shorturl })
    .then((result) => {
      console.log(result);
      res.redirect(result.url);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
