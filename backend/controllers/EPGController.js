const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { validateEPGInput, validateEPGUrl } = require("../utils/validators");

/**
 * EPG (Electronic Program Guide) Controller
 * Manages EPG URLs and validation
 */
module.exports = {
  /**
   * Get current EPG configuration
   */
  async getEPG(req, res) {
    try {
      const epgPath = path.join(
        process.env.STORAGE_PATH || "/tmp",
        "epg.json"
      );

      let epgConfig = {
        url: null,
        format: "xmltv",
        channels: [],
        lastFetched: null,
      };

      if (fs.existsSync(epgPath)) {
        const fileContent = fs.readFileSync(epgPath, "utf-8");
        epgConfig = JSON.parse(fileContent);
      }

      return res.json({
        success: true,
        epg: epgConfig,
      });
    } catch (error) {
      console.error("Error loading EPG configuration:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error loading EPG configuration",
      });
    }
  },

  /**
   * Set or update EPG configuration
   */
  async setEPG(req, res) {
    try {
      const { url, format } = req.body;

      // Validate input
      const validation = validateEPGInput({ url, format });
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.error,
        });
      }

      // Validate EPG URL is reachable (timeout after 5 seconds)
      try {
        const response = await axios.head(url, {
          timeout: 5000,
          maxRedirects: 5,
        });

        if (response.status !== 200) {
          return res.status(400).json({
            success: false,
            message: "EPG URL is not accessible",
          });
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: `EPG URL validation failed: ${error.message}`,
        });
      }

      const epgPath = path.join(
        process.env.STORAGE_PATH || "/tmp",
        "epg.json"
      );

      const epgConfig = {
        url: url,
        format: format || "xmltv",
        channels: [],
        lastUpdated: new Date().toISOString(),
      };

      fs.writeFileSync(epgPath, JSON.stringify(epgConfig, null, 2));

      return res.json({
        success: true,
        message: "EPG configuration updated successfully",
        epg: epgConfig,
      });
    } catch (error) {
      console.error("Error updating EPG configuration:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error updating EPG configuration",
      });
    }
  },

  /**
   * Delete EPG configuration
   */
  async deleteEPG(req, res) {
    try {
      const epgPath = path.join(
        process.env.STORAGE_PATH || "/tmp",
        "epg.json"
      );

      if (fs.existsSync(epgPath)) {
        fs.unlinkSync(epgPath);
      }

      return res.json({
        success: true,
        message: "EPG configuration deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting EPG configuration:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error deleting EPG configuration",
      });
    }
  },
};
