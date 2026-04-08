import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const CsrfToken = sequelize.define(
  "CsrfToken",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sessionSid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    tokenHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "csrf_tokens",
    timestamps: true,
    updatedAt: "updatedAt",
    createdAt: "createdAt",
  }
);

export default CsrfToken;
