const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.js");

const checkUserAuth = async (req, res, next) => {
  let token;
  const { authorization } = req.headers;

  if (authorization && authorization.startsWith("Bearer ")) {
    try {
      token = authorization.split(" ")[1];

      // Verify Token
      const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY);

      // Get User from Token
      req.user = await UserModel.findById(userID).select("-password");
      console.log(req.user);
      next();
    } catch (error) {
      console.log(error);
      return res.status(401).send({
        code: 401,
        status: "failed",
        message: "Unauthorized User",
      });
    }
  } else {
    if (!token) {
      return res.status(401).send({
        code: 401,
        status: "failed",
        message: "Unauthorized User, No Token",
      });
    }
  }
};

module.exports = checkUserAuth;
