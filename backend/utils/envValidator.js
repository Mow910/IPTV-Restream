const Joi = require("joi");

/**
 * Environment variable validation schema and utilities
 */

const envSchema = Joi.object({
  // Server config
  NODE_ENV: Joi.string().valid("development", "production").default("development"),
  PORT: Joi.number().port().default(5000),
  
  // Admin config
  ADMIN_ENABLED: Joi.string().valid("true", "false").default("false"),
  ADMIN_PASSWORD: Joi.when("ADMIN_ENABLED", {
    is: "true",
    then: Joi.string().min(8).max(256).required(),
    otherwise: Joi.string().optional(),
  }),
  CHANNEL_SELECTION_REQUIRES_ADMIN: Joi.string().valid("true", "false").default("false"),
  JWT_EXPIRY: Joi.string().default("24h"),
  
  // Storage
  STORAGE_PATH: Joi.string().default("/streams"),
  
  // CORS
  ALLOWED_ORIGINS: Joi.string().optional(),
  
  // Backend URL
  BACKEND_URL: Joi.string().uri().optional(),
  
  // Optional: Frontend domain for CSRF protection
  FRONTEND_URL: Joi.string().uri().optional(),
})
  .unknown(true) // Allow other env vars we don't validate
  .messages({
    "any.only": "{#label} must be one of {#valids}",
    "number.base": "{#label} must be a number",
    "number.port": "{#label} must be a valid port number (1-65535)",
    "string.min": "{#label} must be at least {#limit} characters",
    "string.max": "{#label} must not exceed {#limit} characters",
    "string.uri": "{#label} must be a valid URL",
    "any.required": "{#label} is required when ADMIN_ENABLED is true",
  });

/**
 * Validate all environment variables on startup
 * @throws {Error} If validation fails
 */
function validateEnvVars() {
  const { error, value } = envSchema.validate(process.env, {
    abortEarly: false,
  });

  if (error) {
    const messages = error.details.map((d) => `  • ${d.message}`).join("\n");
    throw new Error(`Environment validation failed:\n${messages}`);
  }

  // Additional custom validations
  if (process.env.ADMIN_ENABLED === "true" && !process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_PASSWORD must be set when ADMIN_ENABLED=true");
  }

  return value;
}

module.exports = {
  validateEnvVars,
  envSchema,
};
