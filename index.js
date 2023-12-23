const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const cors = require("cors");
const PORT = 8000;
const authRoutes = require("./Routes/Auth");
const blogRoutes = require("./Routes/Blog");
require("dotenv").config();
require("./db");
const cookieParser = require("cookie-parser");
const User = require("./Models/UserSchema");

app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/blog", blogRoutes);

app.get("/", (req, res) => {
  res.json({ message: "The API is working" });
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
