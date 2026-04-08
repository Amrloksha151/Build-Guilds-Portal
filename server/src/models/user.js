import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize";

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  role: {
    type: DataTypes.ENUM("admin", "organizer", "participant"),
    allowNull: false,
    defaultValue: "participant",
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
    },
});

export default User;