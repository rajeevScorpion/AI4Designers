import { createRequestHandler } from '@vercel/node'
import express from 'express'
import session from 'express-session'
import { registerRoutes } from '../../server/routes'

const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Session middleware for serverless
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  store: new (require('memorystore')(session))({
    checkPeriod: 86400000 // prune expired entries every 24h
  })
}))

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

// Register all routes
registerRoutes(app)

// Export the Express app as a serverless function
export default createRequestHandler(app)