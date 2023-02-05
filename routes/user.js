const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const {
  validateName,
  validateEmail,
  validatePassword,
} = require("../utils/validators");
const isAuthenticated = require("../middlewares/authJwt");

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(403).json({ err: "User already exists" });
    }

    if (!validateName(name)) {
      return res.status(400).json({
        err: "Invalid user name: name must be longer than two characters and must not include any numbers or special characters",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ err: "Error: Invalid email" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        err: "Error: Invalid password: password must be at least 8 characters long and must include atleast one - one uppercase letter, one lowercase letter, one digit, one special character",
      });
    }

    const hashedPassword = await bcrypt.hash(password, (saltOrRounds = 10));
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    const createdUser = await user.save();

    return res.status(200).json({
      message: `Account Created Successfully Thank you for signing up`,
      user: createdUser,
    });
  } catch (err) {
    return res.status(500).json({ err: err.message });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email.length === 0) {
      return res.status(400).json({ err: "Please enter your email" });
    }
    if (password.length === 0) {
      return res.status(400).json({ err: "Please enter your password" });
    }

    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      return res.status(403).json("Error: User not found");
    }

    const passwordMatched = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!passwordMatched) {
      return res.status(400).send({
        message: "Email or Password is Incorrect!",
      });
    }

    const payload = { user: { id: existingUser._id } };
    const bearerToken = await jwt.sign(payload, process.env.secret, {
      expiresIn: "1h",
    });
    //save token in db
    existingUser.token = bearerToken;
    existingUser.save();
    res.cookie("token", bearerToken, { expire: new Date() + 360000 });

    return res.status(200).json({
      message: "Signed In Successfully!",
      bearerToken: bearerToken,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: err.message });
  }
});

router.get("/signout", isAuthenticated, async (req, res) => {
  try {
    res.clearCookie("token");
    const user = await User.findById(req.user._id);
    // delete user.token;
    user.token = "";
    await user.save();
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ err: err.message });
  }
});

module.exports = router;
