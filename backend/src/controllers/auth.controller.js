import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export async function signup(req, res) {
  const { email, password, fullName } = req.body;

  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    //if email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists, please use a diffrent one" });
    }

    //create a random avatar for the user
    const idx = Math.floor(Math.random() * 100) + 1; // generate a num between 1-100
    // why 1-100 because they have 100 random avatars
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    //creake a new user in the database
    const newUser = await User.create({
      email,
      fullName,
      password,
      profilePic: randomAvatar,
    });

    //hmm nhi chhate ki main try/catch block hit so iske liye alag try catch block bnaya
    try {
      await upsertStreamUser({
        id: newUser._id.toString(),//._id hme moongoose ka id deta hai
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
      console.log(`Stream user created for ${newUser.fullName}`);
    } catch (error) {
      console.log("Error creating Stream user:", error);
    }

    // jwt token generate kr rhe hai taki user ko authenticate kr sake
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    //jwt token ko cookie me set kr rhe taki verify ho paye
    //mai hi hu jo ki just upar hmne generate kiya
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,//milli sec me hai uske baad expire( 7days, 24hrs, 60mins, 60secs)
      httpOnly: true, // prevent XSS attacks,
      sameSite: "strict", // prevent CSRF attacks
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    //they provide both email and password
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    //check it the email is existing in the database
    const user = await User.findOne({ email });//user variable me agar .findOne shi rhta to poora document mil jata hai
    if (!user) return res.status(401).json({ message: "Invalid email or password" });
    
    //401 means unauthorized
    //check if the password is correct
    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid email or password" });

    //after checking credentials, we can generate a JWT token which is our flow
    //verify krne ke baad hi token generate krte hai
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    //isko cookie me set krke hmne server ko bheja ek aur option tha frontend pe bhi rkh skte 
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true, // prevent XSS attacks,
      sameSite: "strict", // prevent CSRF attacks
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ success: true, user });//user variable me poora document hai
    //hm details to cookie me rkhe token se derive kr skte but time consuming
    //frontend ko request krna hoga servser se details ke liye
    //isliye user ko bhej rhe hai taki frontend use kar sake using user variable
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export function logout(req, res) {
  res.clearCookie("jwt");//cookie ko clear kr rhe taki user logout ho jaye
  res.status(200).json({ success: true, message: "Logout successful" });
}

export async function onboard(req, res) {
  try {
    const userId = req.user._id;
//saare fields ko fill krliya
    const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;

    //check if all fields are provided
    if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
          !nativeLanguage && "nativeLanguage",
          !learningLanguage && "learningLanguage",
          !location && "location",
        ].filter(Boolean),
      });
    }

    //update the user in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body, //get everything from req.body
        isOnboarded: true,
      },
      { new: true }//
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    //stream me update krna hoga
    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || "",
      });
      console.log(`Stream user updated after onboarding for ${updatedUser.fullName}`);
    } catch (streamError) {
      console.log("Error updating Stream user during onboarding:", streamError.message);
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
