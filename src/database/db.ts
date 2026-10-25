import { Sequelize } from 'sequelize';
import { config } from "../config/config.js";

const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
)

// Throws on failure so the server never starts without a database
export const connectToDB = async () => {
  await sequelize.authenticate()
  console.log("Connected to the database Successfully.")

  // Creates missing tables only; it never alters existing ones (add migrations for schema changes)
  await sequelize.sync()
}

export default sequelize
