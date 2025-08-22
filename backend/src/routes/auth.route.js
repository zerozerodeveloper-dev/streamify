import express from "express";
import { login, logout, onboard, signup } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router(); //express router hme routing ki shakti de rha

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

//hmne check krna hai ki jo access kr rha onboard ko wo authenticated hai ya nhi
router.post("/onboarding", protectRoute, onboard);

// check if user is logged in
router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;
