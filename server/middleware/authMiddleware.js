const jwt = require('jsonwebtoken');
const UserData = require('../models/User');
const MockDB = require('../utils/mockDb');

const getUserModel = () => global.isMockDB ? MockDB.User : UserData;

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (!token || token === 'undefined' || token === 'null') {
         console.warn("[AUTH] Middleware - Received invalid token string:", token);
         return res.status(401).json({ message: 'Not authorized, invalid token format' });
      }

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
      console.error("[AUTH] Middleware Error:", {
          message: error.message,
          token: token ? `${token.substring(0, 10)}...` : 'NONE',
          secretSet: !!process.env.JWT_SECRET
      });
      res.status(401).json({ message: 'Not authorized, token failed', details: error.message });
    }
  } else {
    console.warn("[AUTH] Middleware - No Authorization header found");
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };