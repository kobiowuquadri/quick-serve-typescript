import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { config } from './config/config.js'
import sequelize from './database/db.js'
import router from './routes/index.js'
import { notFound, errorHandler } from './middlewares/errorHandler.js'
import { messageHandler } from './utils/index.js'
import { SUCCESS, SERVICE_UNAVAILABLE } from './constants/statusCode.js'

const app = express()

app.set('trust proxy', config.server.trustProxy)

//middleware
app.use(helmet())
app.use(cors(config.server.corsOrigins.length ? { origin: config.server.corsOrigins } : undefined))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan(config.server.isProduction ? 'combined' : 'dev'))
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send('Backend Connected Successfully')
})

// For uptime monitors and the hosting platform's health check
app.get('/health', async (req, res) => {
    try {
        await sequelize.authenticate()
        res.status(SUCCESS).json(messageHandler('OK', true, SUCCESS, { database: 'up', uptime: process.uptime() }))
    } catch {
        res.status(SERVICE_UNAVAILABLE).json(messageHandler('Database unreachable', false, SERVICE_UNAVAILABLE, { database: 'down' }))
    }
})

//routes
router(app)

// Must come after all routes
app.use(notFound)
app.use(errorHandler)

export default app
