require("dotenv").config();
const authService = require("../services/auth/AuthService");
const { validateAdminInput } = require("../utils/validators");

module.exports = {
  /**
   * Register admin user (first time setup)
   * Only works if no password is set yet
   */
  adminRegister(req, res) {
    if (!authService.isAdminEnabled()) {
      return res.status(403).json({
        success: false,
        message: "Admin mode is disabled on this server",
      });
    }

    // In production, implement: check if admin already exists in database
    // For now, we only support password via environment variable

    return res.status(400).json({
      success: false,
      message: "Admin registration is managed via environment variables. Set ADMIN_PASSWORD in .env",
    });
  },

  /**
   * Admin login with password
   */
  adminLogin(req, res) {
    if (!authService.isAdminEnabled()) {
      return res.status(403).json({
        success: false,
        message: "Admin mode is disabled on this server",
      });
    }

    const { password } = req.body;

    // Input validation
    const validation = validateAdminInput({ password });
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    if (authService.verifyAdminPassword(password)) {
      const token = authService.generateAdminToken();

      return res.json({
        success: true,
        token,
      });
    } else {
      // Don't reveal if password is wrong (security best practice)
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
  },

  /**
   * Check admin status
   */
  checkAdminStatus(req, res) {
    res.json({
      enabled: authService.isAdminEnabled(),
      channelSelectionRequiresAdmin: authService.channelSelectionRequiresAdmin(),
    });
  },

  /**
   * Verify JWT token middleware
   */
  verifyToken(req, res, next) {
    // If admin mode is disabled, allow all requests (skip authentication)
    if (!authService.isAdminEnabled()) {
      req.user = { isAdmin: false };
      return next();
    }

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = authService.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    req.user = decoded;
    next();
  },
};
