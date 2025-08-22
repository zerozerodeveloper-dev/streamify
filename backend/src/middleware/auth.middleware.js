import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    //yaad hai hmne jwt ka use krke data ko encode kiya and res.cookie
    //server pe send kr diya yha decode me which encode cheez decode ho ke
    //aa jayega but we are verifying it phele
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    //dekh hmm server se frontend ko user ki details bhej rhe hai
    //but frontend me hmm password nhi bhejna chahte
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    req.user = user;

    //next method ko call kr le ye theek hai joki onboard hai aree hmne 
    //router.post("/onboarding", protectRoute, onboard); smjha
    next();
    
  } catch (error) {
    console.log("Error in protectRoute middleware", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
