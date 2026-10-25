import { config } from './config/config.js'
import app from './app.js'
import sequelize, { connectToDB } from './database/db.js'

const start = async () => {
    await connectToDB()

    const server = app.listen(config.server.port, () => {
        console.log(`Server running on port ${config.server.port}`)
    })

    // Let in-flight requests finish and close DB connections when the host stops the app (e.g. on redeploy)
    const shutdown = (signal: string) => {
        console.log(`${signal} received, shutting down...`)
        server.close(async () => {
            await sequelize.close()
            process.exit(0)
        })
        setTimeout(() => process.exit(1), 10_000).unref()
    }

    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)
}

start().catch((error) => {
    console.error('Failed to start server:', error)
    process.exit(1)
})
