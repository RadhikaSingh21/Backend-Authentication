const UserModel = require("../models/user.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../config/EmailConfig.js");

const UserRegistration = async (req, res, next) => {
  try {
    const { name, email, password, password_confirmation, tc } = req?.body;
    const user = await UserModel.findOne({ email: email });
    if (user) {
      console.log(1);
      res.send({
        status: "failed",
        message: "Email already exist",
      });
    } else {
      console.log(2);
      if (name && email && password && password_confirmation && tc) {
        console.log(3);
        if (password === password_confirmation) {
          try {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            const User = new UserModel({
              name: name,
              email: email,
              password: hashPassword,
              tc: tc,
            });
            await User.save();
            const saved_user = await UserModel.findOne({ email: email });
            //Genrate JWT
            const token = jwt.sign(
              { userID: saved_user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );
            res.send({
              status: "success",
              message: "Registration Success",
              token: token,
            });
          } catch (error) {
            console.log(error);
            res.send({
              status: "failed",
              message: "Unable to Register",
            });
          }
        } else {
          res.send({
            status: "failed",
            message: "Password and Confrimation doesn't match",
          });
        }
      } else {
        console.log(4);
        res.send({
          status: "failed",
          message: "All fields are required",
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

const UserLogin = async (req, res, next) => {
  try {
    const { email, password } = req?.body;
    const user = await UserModel.findOne({ email: email });
    if (user != null) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (user.email === email && isMatch) {
        //Generate JWT Token
        const token = jwt.sign(
          { userID: user._id },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "5d" }
        );

        res.send({
          status: "Success",
          message: "Login Successfully ",
          token: token,
        });
      } else {
        res.send({
          status: "failed",
          message: "Email or Password is Not Valid ",
        });
      }
    } else {
      res.send({
        status: "failed",
        message: "You are not Registered User",
      });
    }
    if (email && password) {
    } else {
      res.send({
        status: "failed",
        message: "All fields are required",
      });
    }
  } catch (error) {
    next(error);
    res.send({
      status: "failed",
      message: "Unable to login",
    });
  }
};

const changeUserPassword = async (req, res, next) => {
  const { password, password_confirmation } = req?.body;
  if (password && password_confirmation) {
    if (password !== password_confirmation) {
      res.send({
        status: "failed",
        message: "New Password and Confrim Password doesn't match",
      });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);
      await UserModel.findByIdAndUpdate(req.user._id, {
        $set: { password: hashPassword },
      });
      console.log(req.user._id);
      res.send({
        status: "success",
        message: "Password Changes Successfully",
      });
    }
  } else {
    res.send({
      status: "failed",
      message: "All Fields are required",
    });
  }
};

const loggedUser = async (req, res, next) => {
  res.send({ user: req.user });
};

const senduserPasswordResetEmail = async (req, res, next) => {
  const { email } = req.body;
  if (email) {
    const user = await UserModel.findOne({ email: email });
    if (user) {
      const secret = user._id + process.env.JWT_SECRET_KEY;
      const token = jwt.sign({ userID: user._id }, secret, {
        expiresIn: "15m",
      });
      const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`;

      console.log(link);

      let info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "GeekShop - Password Reset Link",
        html: `<a href=${link}>Click Here</a> to Reset Your Password`,
      });

      res.send({
        status: "success",
        message: "Password Reset Email Sent... Please Check Your Email",
      });
    } else {
      res.send({
        status: "failed",
        message: "Email doesn't exist",
      });
    }
  }
};

const userPasswordReset = async (req, res) => {
  const { password, password_confirmation } = req.body;
  const { id, token } = req.params;
  const user = await UserModel.findById(id);
  const new_secret = user._id + process.env.JWT_SECRET_KEY;
  try {
    jwt.verify(token, new_secret);
    if (password && password_confirmation) {
      if (password !== password_confirmation) {
        res.send({
          status: "failed",
          message: "New Password and Confirm New Password doesn't match",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const newHashPassword = await bcrypt.hash(password, salt);
        await UserModel.findByIdAndUpdate(user._id, {
          $set: { password: newHashPassword },
        });
        res.send({ status: "success", message: "Password Reset Successfully" });
      }
    } else {
      res.send({ status: "failed", message: "All Fields are Required" });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: "failed", message: "Invalid Token" });
  }
};
module.exports = {
  UserRegistration,
  UserLogin,
  changeUserPassword,
  loggedUser,
  senduserPasswordResetEmail,
  userPasswordReset,
};
