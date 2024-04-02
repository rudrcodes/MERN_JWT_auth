import express from 'express'
import bcrypt from 'bcrypt'
const router = express.Router();
import { User } from "../models/User.js";
import { Admin } from '../models/Admin.js';
import {TeamHierarchyModel} from '../models/TeamHierarchy.js';
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";


router.post('/register', async (req, res) => {
  const { name, username, email, mobile, sponsorId, sponsorName, position, password, confirmPassword } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.json({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      email,
      mobile,
      sponsorId,
      sponsorName,
      position,
      password: hashPassword,
      confirmPassword,
    });

    await newUser.save();

    // Update TeamHierarchy model
    if (sponsorId) { // Validate sponsorId
      let sponsor = await User.findOne({ userId: sponsorId }); 
      // Use findById instead of findOne

      if (!sponsor) {
        return res.status(404).json({ error: "Sponsor not found" });
      }

      let level = 1;
      if (sponsorId !== newUser.userId) { // Ensure not to count self as level 1
        const sponsorHierarchy = await TeamHierarchyModel.findOne({ userId: sponsorId });
        level = sponsorHierarchy ? sponsorHierarchy.level + 1 : 1; // If sponsorHierarchy not found, set level to 1
      }

      const teamHierarchyEntry = new TeamHierarchyModel({
        userId: newUser.userId,
        sponsorId: sponsorId,
        name: name,
        level: level,
        position:position,
      });

      await teamHierarchyEntry.save();
    }
    console.log("User registered ✅: ",newUser)
    // console.log("")
    res.json({ message: "User registered successfully",user:newUser});
    
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: "user is not registered" });
    
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.json({ message: "password is incorrect" });
  }
 
  const token = jwt.sign({ username: user.username , email : user.email ,name: user.name, userId:user.userId }, process.env.KEY, {
    expiresIn: "1h",
  });
  res.cookie("token", token, { httpOnly: true, maxAge: 360000 });
  return res.json({ status: true, message: "login successfully" ,user});
});



router.post('/adminsignup', async (req, res) => {
  const {username, email, password } = req.body;
  const admin = await Admin.findOne({email});
  if (admin) {
    return res.json({message: "admin already existed" });
  }

  const hashpassword = await bcrypt.hash(password, 10);
  const newAdmin = new Admin({
    username,
    email,
    password: hashpassword,
  });

  await newAdmin.save();
  return res.json({ status: true, message: "record registed" });
});


router.post('/adminlogin', async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.json({ message: "admin is not registered" });
  }

  const validPassword = await bcrypt.compare(password, admin.password);
  if (!validPassword) {
    return res.json({ message: "password is incorrect" });
  }

  const token = jwt.sign({ username: admin.username }, process.env.KEY, {
    expiresIn: "1h",
  });
  res.cookie("token", token, { httpOnly: true, maxAge: 360000 });
  return res.json({ status: true, message: "login successfully" });
});


router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "user not registered" });
    }
    //var nodemailer = require('nodemailer');

    const token = jwt.sign({ id: user._id }, process.env.KEY, {
      expiresIn: "5m",
    });
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ruchika14yadav@gmail.com",
        pass: "qmjucbhykfygukbp",
      },
    });
    const encodedToken = encodeURIComponent(token).replace(/\./g, "%2E");
    var mailOptions = {
      from: "ruchika14yada@gmail.com",
      to: email,
      subject: "Reset password",
      text: http://localhost:5173/resetPassword/${encodedToken}
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return res.json({ message: "error sending email sent" });
      } else {
        return res.json({ status: true, message: "Email sent" });
      }
    });
  } catch (err) {
    console.log(err);
  }
});


router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = await jwt.verify(token, process.env.KEY);
    const id = decoded.id;
    const hashpassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(id, { password: hashpassword }); // Update password for the user with the given id
    return res.json({ status: true, message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: "Invalid or expired token" });
  }
});

const verifyUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized - no token provided" });
    }
    const decoded = await jwt.verify(token, process.env.KEY);
    req.decoded = decoded; // Make decoded data available for the route
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Unauthorized - invalid token" });
  }
};

// Route to fetch user profile
router.get('/user-profile', verifyUser, async (req, res) => {
  try {
    // Assuming you store user details in the JWT payload during login
    const { username, email,name, userId } = req.decoded; // Access decoded data from the request object
    console.log('Decoded user:', username, email,name, userId );
    return res.json({ username, email,name, userId }); // Return username, email, and userId in the response
  } catch (err) {
    console.error(err);
    return res.json({ error: "Failed to fetch user profile" });
  }
});


router.get('/myteam', async (req, res) => {
  try {
    // Retrieve user data from database
    const userData = await TeamHierarchyModel.find();

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user data
    res.json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/logout', (req , res) =>{
   res.clearCookie('token')
   return res.json({status :true })
})

router.get('/checkhit', (req , res) =>{
  console.log("Hello World!");
})

router.get('/getUserNameById', async (req , res) => {
  try {
    const { id } = req.query;
    // console.log({id});
    const user = await User.findOne({ userId: id });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    console.error('Error finding user by ID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/my-team',async (req, res) => {
  try {
    const { sponsorId } = req.query // Assuming sponsorId is sent in the query parameters
    
    // Retrieve the team hierarchy data for the given sponsorId
    const teamHierarchyData = await TeamHierarchyModel.find({ sponsorId : sponsorId});

    // Return the team hierarchy data as a response
    res.json(teamHierarchyData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});





export { router as authRoutes };