import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import mongoose from 'mongoose'
import cors from 'cors'
import typeDefs from './schema/typeDefs.js'
import resolvers from './schema/resolvers.js'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config() // Load .env

console.log('JWT_SECRET:', process.env.JWT_SECRET)

const JWT_SECRET = process.env.JWT_SECRET
const MONGODB_URI = process.env.MONGODB_URI // <-- Add this line

const app = express()
app.use(cors())

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const auth = req.headers.authorization || ''
    if (auth.startsWith('Bearer ')) {
      try {
        const token = auth.replace('Bearer ', '')
        const user = jwt.verify(token, JWT_SECRET)
        return { user }
      } catch (e) {
        // Invalid token
        return {}
      }
    }
    return {}
  },
})

await server.start()
server.applyMiddleware({ app })

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientBuildPath = path.join(__dirname, '../dist')

// Serve static files from the Vite build
app.use(express.static(clientBuildPath))

// Serve index.html for all non-API routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'))
})

app.listen({ port: 4000 }, () =>
  console.log('Server ready at http://localhost:4000' + server.graphqlPath)
)