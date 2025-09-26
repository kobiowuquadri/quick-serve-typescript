import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../database/db.js";

// This is the attributes for the Auth model
export interface AuthAttributes {
    id: number;
    email: string;
    password: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

// This is the creation attributes for the Auth model
export interface AuthCreationAttributes extends Optional<AuthAttributes, "id"> {}

// This is the model for the Auth model
export class Auth extends Model<AuthAttributes, AuthCreationAttributes> implements AuthAttributes {
    public id!: number;
    public email!: string;
    public password!: string;
    public refreshToken!: string;
    public refreshTokenExpiresAt!: Date;
    public createdAt!: Date;
    public updatedAt!: Date;
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

export const AuthModel = sequelize.define('Auth', AuthSchema);