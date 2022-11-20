import { DataTypes } from "sequelize"

export const ally = {
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
        allowNull: false
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    all_points: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    rank: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
};

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
    new_owner: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    old_owner: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    old_tribe_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    new_tribe_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
};

export const player = {
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
    ally: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    villages: {
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
    type: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
} as const;