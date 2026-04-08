require("dotenv").config();

const databaseUrl = process.env.DATABASE_URL || "";
const databaseHost = (() => {
  try {
    return new URL(databaseUrl).hostname;
  } catch {
    return "";
  }
})();

const shouldUseSsl =
  process.env.DB_SSL === "true" ||
  (!process.env.DB_SSL && databaseHost.includes("neon.tech"));

const baseConfig = {
  dialect: "postgres",
  dialectOptions: shouldUseSsl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
  logging: false,
};

module.exports = {
  development: {
    ...baseConfig,
    url: process.env.DATABASE_URL,
  },
  test: {
    ...baseConfig,
    url: process.env.DATABASE_URL,
  },
  production: {
    ...baseConfig,
    url: process.env.DATABASE_URL,
  },
};
