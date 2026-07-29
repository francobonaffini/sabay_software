import express from 'express'
import { buildV1Router } from './api/v1/v1.router.js'
import { errorHandler } from './shared/middleware/errorHandler.js'
import { notFoundHandler } from './shared/middleware/notFound.js'

/**
 * @param {{ v1Router?: import('express').Router }} [deps]
 */
const buildApp = ({ v1Router = buildV1Router() } = {}) => {
    const app = express()

    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', environment: process.env.NODE_ENV ?? 'development' })
    })

    app.use('/api/v1', v1Router)

    app.use(notFoundHandler)
    app.use(errorHandler)

    return app
}

export { buildApp }