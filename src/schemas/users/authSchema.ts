import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../database/db.js";

// This is the attributes for the Auth model
export interface AuthAttributes {
    id: number;
    email: string;
    password: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

// This is the creation attributes for the Auth model
export interface AuthCreationAttributes extends Optional<AuthAttributes, "id" | "refreshToken" | "refreshTokenExpiresAt" | "createdAt" | "updatedAt"> {}

// This is the model for the Auth model
export class Auth extends Model<AuthAttributes, AuthCreationAttributes> implements AuthAttributes {
    declare id: number;
    declare email: string;
    declare password: string;
    declare refreshToken: string;
    declare refreshTokenExpiresAt: Date | null;
    declare createdAt: Date;
    declare updatedAt: Date;
}

// This is the schema for the Auth model
export const AuthSchema = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    refreshToken: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
    },
    refreshTokenExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
} as const;

// Initialize and export the Sequelize model instance
Auth.init(AuthSchema, {
    sequelize,
    modelName: "Auth",
    tableName: "auths",
});

export { Auth as default };