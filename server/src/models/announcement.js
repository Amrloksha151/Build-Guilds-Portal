import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const Announcement = sequelize.define(
    "Announcement", 
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        time: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        author: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: "announcements",
        timestamps: false,
    }
);

export default Announcement;