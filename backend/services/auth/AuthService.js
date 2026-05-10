require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

/**
 * Service for handling JWT authentication with improved security
 */
class AuthService {
  constructor() {
    this.ADMIN_ENABLED = process.env.ADMIN_ENABLED === "true";
    this.CHANNEL_SELECTION_REQUIRES_ADMIN =
      process.env.CHANNEL_SELECTION_REQUIRES_ADMIN === "true";
    
    this.JWT_EXPIRY = process.env.JWT_EXPIRY || "24h";

    // Initialize JWT secret - use stored secret or generate new one
    this.JWT_SECRET = this._initializeJWTSecret();

    // Initialize admin password hash if admin mode is enabled
    if (this.ADMIN_ENABLED) {
      this.adminPasswordHash = this._loadOrCreateAdminPassword();
    }

    if (
      this.ADMIN_ENABLED &&
      !this.adminPasswordHash
    ) {
      throw new Error(
        "Admin password could not be initialized. Check .env and storage permissions."
      );
    }
  }

  /**
   * Initialize or load JWT secret from secure storage
   * @returns {string} JWT secret
   */
  _initializeJWTSecret() {
    const secretPath = path.join(process.env.STORAGE_PATH || "/tmp", ".jwt_secret");
    
    try {
      if (fs.existsSync(secretPath)) {
        const secret = fs.readFileSync(secretPath, 'utf-8').trim();
        if (secret.length >= 32) {
          return secret;
        }
      }
    } catch (err) {
      console.warn("Could not read JWT secret from disk, generating new one");
    }

    // Generate new random secret
    const newSecret = crypto.randomBytes(32).toString('hex');
    
    try {
      fs.writeFileSync(secretPath, newSecret, { mode: 0o600 });
    } catch (err) {
      console.warn("Could not persist JWT secret to disk:", err.message);
    }

    return newSecret;
  }

  /**
   * Load or create hashed admin password
   * @returns {string} Hashed password
   */
  _loadOrCreateAdminPassword() {
    if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 8) {
      throw new Error(
        "ADMIN_PASSWORD must be set and at least 8 characters long for security."
      );
    }

    try {
      // Hash the password with bcrypt (10 salt rounds)
      // Note: This should be done once during setup, not on every server start
      // In production, store the hash in a database
      return bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
    } catch (err) {
      console.error("Error hashing password:", err.message);
      return null;
    }
  }

  /**
   * Check if channel selection needs admin
   * @returns {boolean}
   */
  channelSelectionRequiresAdmin() {
    return this.CHANNEL_SELECTION_REQUIRES_ADMIN && this.ADMIN_ENABLED;
  }

  /**
   * Generate a JWT token for an admin user
   * @returns {string} JWT token
   */
  generateAdminToken() {
    return jwt.sign({ isAdmin: true, iat: Date.now() }, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRY,
    });
  }

  /**
   * Verify a JWT token
   * @param {string} token - The JWT token to verify
   * @returns {Object|null} Decoded token payload or null if invalid
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if admin mode is enabled
   * @returns {boolean} True if admin mode is enabled
   */
  isAdminEnabled() {
    return this.ADMIN_ENABLED;
  }

  /**
   * Verify admin password using bcrypt
   * @param {string} password - Password to verify
   * @returns {boolean} True if password matches
   */
  verifyAdminPassword(password) {
    if (!this.adminPasswordHash) {
      return false;
    }
    try {
      return bcrypt.compareSync(password, this.adminPasswordHash);
    } catch (err) {
      console.error("Password verification error (logged without password)");
      return false;
    }
  }

  /**
   * Get hashed password (for storing in database, not for comparing)
   * @param {string} password - Plain text password
   * @returns {string} Hashed password
   */
  hashPassword(password) {
    try {
      return bcrypt.hashSync(password, 10);
    } catch (err) {
      console.error("Password hashing error");
      return null;
    }
  }
}

module.exports = new AuthService();
