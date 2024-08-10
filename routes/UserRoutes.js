const express = require("express");
const router = express.Router();
const {
  UserRegistration,
  UserLogin,
  changeUserPassword,
  loggedUser,
  senduserPasswordResetEmail,
  userPasswordReset,
} = require("../controllers/UserController.js");
const checkUserAuth = require("../middleware/Auth-middleware.js");

//Route Level Middleware
router.use("/changepassword", checkUserAuth);
router.use("/loggedUser", checkUserAuth);
//Public Routes
router.post("/register", UserRegistration);
router.post("/login", UserLogin);
router.post("/send-reset-password-email", senduserPasswordResetEmail);
router.post("/reset-password/:id/:token", userPasswordReset);
//Protected Routes
router.post("/changepassword", changeUserPassword);
router.get("/loggedUser", loggedUser);

module.exports = router;
