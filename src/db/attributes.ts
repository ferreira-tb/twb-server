import { DataTypes } from "sequelize"

export const ally = {
    ally_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tag: {
        type: DataTypes.STRING,
        allowNull: false
    },
    members: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    villages: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    all_points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    rank: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
} as const;

export const conquer = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    },
    village_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    time: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    new_owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    old_owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    new_tribe_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    old_tribe_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
} as const;

export const player = {
    player_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ally_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    villages: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    rank: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
} as const;

export const village = {
    village_id: {
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
    player_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
} as const;