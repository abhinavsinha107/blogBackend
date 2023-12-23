const express = require("express");
const router = express.Router();
const User = require("../Models/UserSchema");
const errorHandler = require("../Middlewares/errorMiddleware");
// const authTokenHandler = require("../Middlewares/checkAuthToken");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");


// ugopdlzqmmvsebcg

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "abhinavsinha135@gmail.com",
    pass: "ugopdlzqmmvsebcg",
  },
});

router.get("/test", async (req, res) => {
  res.json({
    message: "Auth api is working",
  });
});

router.post("/sendotp", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    const mailOptions = {
      from: process.env.COMPANY_EMAIL,
      to: email,
      subject: "OTP for verification",
      text: `Your OTP for verification is ${otp}`,
    };

    transporter.sendMail(mailOptions, async (err, info) => {
      if (err) {
        console.log(err);
        res.status(500).json({
          message: err.message
        });
      } else {
        res.json({
          message: "OTP sent successfully",
          otp: otp
        });
      }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exsits"
      });
    }

    const newUser = new User({
      name,
      password,
      email,
    });

    await newUser.save(); // Await the save operation

    res.status(201).json({
      message: "User registered successfully"
    });
  } catch (err) {
    // Pass the error to the error middleware
    next(err);
  }
});


router.post('/login', async (req, res, next) => {
  try {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user) {
      return res.status(400).json({
        message: "Invalid email or password"
      })
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
      return res.status(400).json({
        message: "Invalid Credentials"
      })
    }

    const authToken = jwt.sign({userId: user._id}, process.env.JWT_SECRET_KEY, {expiresIn: '10m'});
    const refreshToken = jwt.sign({userId: user._id}, process.env.JWT_REFRESH_SECRET_KEY, {expiresIn: '40m'});

    res.cookie('authToken', authToken, {httpOnly: true});
    res.cookie('refreshToken', refreshToken, {httpOnly: true});
    res.status(200).json({
      message: "Login Successful",
    });

  } catch(err) {
    next(err);
  }
})

router.use(errorHandler);

module.exports = router;
