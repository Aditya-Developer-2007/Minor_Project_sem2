const jwt = require('jsonwebtoken');
const UserData = require('../models/User');
const MockDB = require('../utils/mockDb');

const getUserModel = () => global.isMockDB ? MockDB.User : UserData;

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("[AUTH] Middleware - Token Decoded. ID:", decoded.id);
      
      const User = getUserModel();
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.warn("[AUTH] Middleware - User not found for ID:", decoded.id);
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = user;
      console.log("[AUTH] Middleware - Access Granted for:", user.email || user.name);
      next();
    } catch (error) {
      console.error("[AUTH] Middleware Error:", error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };