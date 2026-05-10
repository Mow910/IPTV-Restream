const xss = require("xss");
const { URL } = require("url");

/**
 * Input validators with XSS protection
 */

const validators = {
  /**
   * Validate admin inputs
   */
  validateAdminInput(data) {
    const { password } = data;

    if (!password || password.length < 8) {
      return {
        valid: false,
        error: "Password must be at least 8 characters long",
      };
    }

    if (password.length > 256) {
      return {
        valid: false,
        error: "Password is too long (max 256 characters)",
      };
    }

    return { valid: true };
  },

  /**
   * Validate settings input
   */
  validateSettingsInput(data) {
    const { siteName, siteDescription, theme, epgUrl } = data;

    if (siteName && siteName.length > 100) {
      return {
        valid: false,
        error: "Site name is too long (max 100 characters)",
      };
    }

    if (siteDescription && siteDescription.length > 500) {
      return {
        valid: false,
        error: "Site description is too long (max 500 characters)",
      };
    }

    if (theme && !["dark", "light", "auto"].includes(theme)) {
      return {
        valid: false,
        error: "Invalid theme option",
      };
    }

    if (epgUrl && !validators.isValidUrl(epgUrl)) {
      return {
        valid: false,
        error: "Invalid EPG URL",
      };
    }

    return { valid: true };
  },

  /**
   * Validate EPG input
   */
  validateEPGInput(data) {
    const { url, format } = data;

    if (!url) {
      return {
        valid: false,
        error: "EPG URL is required",
      };
    }

    if (!validators.isValidUrl(url)) {
      return {
        valid: false,
        error: "Invalid EPG URL format",
      };
    }

    if (format && !["xmltv", "m3u"].includes(format)) {
      return {
        valid: false,
        error: "Invalid EPG format",
      };
    }

    // EPG URLs should use HTTP/HTTPS
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return {
        valid: false,
        error: "EPG URL must use HTTP or HTTPS",
      };
    }

    return { valid: true };
  },

  /**
   * Validate EPG URL is reachable
   */
  validateEPGUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validate channel data
   */
  validateChannelData(data) {
    const { name, url, group, logo, headers } = data;

    // Sanitize name (remove XSS attempts)
    if (name && name.length > 200) {
      return {
        valid: false,
        error: "Channel name is too long (max 200 characters)",
      };
    }

    if (!validators.isValidUrl(url)) {
      return {
        valid: false,
        error: "Invalid stream URL",
      };
    }

    if (group && group.length > 100) {
      return {
        valid: false,
        error: "Channel group is too long (max 100 characters)",
      };
    }

    if (logo && logo.length > 2048) {
      return {
        valid: false,
        error: "Logo URL is too long",
      };
    }

    if (headers && typeof headers !== "object") {
      return {
        valid: false,
        error: "Headers must be an object",
      };
    }

    // Validate headers are safe
    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        if (
          typeof key !== "string" ||
          typeof value !== "string" ||
          key.length > 100 ||
          value.length > 2048
        ) {
          return {
            valid: false,
            error: "Invalid header format",
          };
        }
      }
    }

    return { valid: true };
  },

  /**
   * Check if URL is valid
   */
  isValidUrl(url) {
    try {
      const parsed = new URL(url);
      // Only allow http/https for security
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  },

  /**
   * Sanitize HTML/text to prevent XSS
   */
  sanitizeText(text) {
    if (!text) return "";
    return xss(text, {
      whiteList: {},
      stripIgnoredTag: true,
      stripLeadingAndTrailingWhitespace: true,
    });
  },

  /**
   * Escape FFmpeg arguments to prevent command injection
   */
  escapeFfmpegArg(arg) {
    if (typeof arg !== "string") {
      return "";
    }

    // Only allow safe characters in stream URLs and certain params
    // Disallow shell metacharacters
    const dangerous = /[&|;`$(){}[\]<>\\'"!?*#]/;
    if (dangerous.test(arg)) {
      return "";
    }

    return arg;
  },

  /**
   * Validate stream headers don't contain injection attempts
   */
  validateStreamHeaders(headers) {
    if (!headers || typeof headers !== "object") {
      return { valid: true, headers: {} };
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(headers)) {
      // Header names should be alphanumeric + hyphens
      if (!/^[a-zA-Z0-9\-]+$/.test(key)) {
        return {
          valid: false,
          error: `Invalid header name: ${key}`,
        };
      }

      // Header values can contain more characters but no newlines/carriage returns
      if (typeof value === "string" && /[\r\n]/.test(value)) {
        return {
          valid: false,
          error: "Header values cannot contain newlines",
        };
      }

      sanitized[key] = value;
    }

    return { valid: true, headers: sanitized };
  },
};

module.exports = validators;
