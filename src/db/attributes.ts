import { DataTypes } from "sequelize"

export const village = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    x: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    y: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    player: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    rank: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
} as const;