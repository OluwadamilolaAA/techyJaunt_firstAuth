const express = require("express");
const { isAuth, isAdmin } = require('../middlewares/auth');
const { upload } = require("../config/cloudinary");
const {
  signup,
  login,
  makeAdmin,
  forgotPassword,
  resetPassword,
  verifyOtp,
  verifyEmail,
  initiateGoogleAuth,
  handleGoogleCallback,
  unlinkGoogle,
  setPasswordForGoogleUser,
  updateProfile,
  getUserProfile,
  uploadProfilePicture,
  deleteProfilePicture,
} = require("../controller/user.controller");
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.patch("/make-admin/:userId", makeAdmin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:userId", resetPassword);
router.post("/verify-otp", verifyOtp);
router.post("/verify-email/:token", verifyEmail);

// Server-side Google OAuth routes
router.get("/google", initiateGoogleAuth);
router.get("/google/callback", handleGoogleCallback);
router.delete("/unlink-google/:userId", unlinkGoogle);
router.post("/set-password/:userId", setPasswordForGoogleUser);

// Profile management routes (protected)
router.get("/profile", isAuth, getUserProfile);
router.put("/profile", isAuth, updateProfile);
router.post(
  "/profile/picture",
  isAuth,
  upload.single("profilePicture"),
  uploadProfilePicture
);
router.delete("/profile/picture", isAuth, deleteProfilePicture);

module.exports = router;
