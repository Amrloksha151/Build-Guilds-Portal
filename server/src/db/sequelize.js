import { Sequelize } from "sequelize";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

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

export const sequelize = new Sequelize(databaseUrl, {
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
});

export default sequelize;
