import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";
import User from "./user.js"

const Team = sequelize.define(
    "Team",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            unique: true
        }
    },
    {
        tableName: "teams",
        timestamps: false
    }
);

Team.hasMany(User);
User.belongsTo(Team);

export default Team;