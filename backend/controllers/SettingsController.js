const fs = require("fs");
const path = require("path");
const { validateSettingsInput } = require("../utils/validators");

/**
 * Settings Controller - manage site settings, EPG, etc.
 */
module.exports = {
  /**
   * Get current settings
   */
  async getSettings(req, res) {
    try {
      const settingsPath = path.join(
        process.env.STORAGE_PATH || "/tmp",
        "settings.json"
      );

      let settings = {
        siteName: "StreamHub",
        siteDescription: "IPTV Restream Platform",
        logo: null,
        theme: "dark",
        epgUrl: null,
      };

      if (fs.existsSync(settingsPath)) {
        const fileContent = fs.readFileSync(settingsPath, "utf-8");
        settings = JSON.parse(fileContent);
      }

      return res.json({
        success: true,
        settings,
      });
    } catch (error) {
      console.error("Error loading settings:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error loading settings",
      });
    }
  },

  /**
   * Update settings
   */
  async updateSettings(req, res) {
    try {
      const { siteName, siteDescription, logo, theme, epgUrl } = req.body;

      // Validate input
      const validation = validateSettingsInput({
        siteName,
        siteDescription,
        theme,
        epgUrl,
      });

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.error,
        });
      }

      const settingsPath = path.join(
        process.env.STORAGE_PATH || "/tmp",
        "settings.json"
      );

      const settings = {
        siteName: siteName || "StreamHub",
        siteDescription: siteDescription || "IPTV Restream Platform",
        logo: logo || null,
        theme: theme || "dark",
        epgUrl: epgUrl || null,
        updatedAt: new Date().toISOString(),
      };

      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

      return res.json({
        success: true,
        message: "Settings updated successfully",
        settings,
      });
    } catch (error) {
      console.error("Error updating settings:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error updating settings",
      });
    }
  },
};
