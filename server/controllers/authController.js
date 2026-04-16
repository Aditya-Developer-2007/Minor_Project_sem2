const UserData = require('../models/User');
const MockDB = require('../utils/mockDb');
const jwt = require('jsonwebtoken');

const getUserModel = () => global.isMockDB ? MockDB.User : UserData;

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const User = getUserModel();
  console.log(`[AUTH] Registering: ${email} (MockDB: ${global.isMockDB})`);

  if (!name || !email || !password) return res.status(400).json({ message: 'Please fill all fields' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return res.status(400).json({ message: 'Invalid email format' });

  try {
    console.log("[AUTH] Checking if user exists...");
    const userExists = await User.findOne({ email });
    if (userExists) {
        console.log("[AUTH] User already exists:", email);
        return res.status(400).json({ message: 'User already exists' });
    }

    console.log("[AUTH] Creating new user record...");
    const user = await User.create({ name, email, password });
    
    if (user) {
      console.log("[AUTH] User created successfully. ID:", user._id);
      console.log("[AUTH] Generating token...");
      const token = generateToken(user._id);
      console.log("[AUTH] Token generated. Sending response.");
      res.status(201).json({ _id: user._id, name: user.name, email: user.email, token: token });
    } else {
      console.error("[AUTH] User creation returned null/undefined");
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error("[AUTH] Fatal Register Error:", error);
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const User = getUserModel();
  
  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password" });
  }

  console.log("Login Attempt for:", email); // Debug: Check email received

  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log("Login Failed: User not found");
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (isMatch) {
      res.json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
    } else {
      console.log("Login Failed: Password incorrect");
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };