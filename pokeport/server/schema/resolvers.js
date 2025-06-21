import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET

export default {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated')
      return await User.findById(user.id)
    },
  },
  Mutation: {
    register: async (_, { username, email, password }) => {
      const hashed = await bcrypt.hash(password, 10)
      const user = await User.create({ username, email, password: hashed })
      return { id: user._id, username: user.username, email: user.email, theme: user.theme }
    },
    login: async (_, { identifier, password }) => {
      const user = await User.findOne({
        $or: [{ username: identifier }, { email: identifier }]
      })
      if (!user) throw new Error('User not found')
      const valid = await bcrypt.compare(password, user.password)
      if (!valid) throw new Error('Invalid password')
      const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET)
      return { token, theme: user.theme }
    },
    setTheme: async (_, { theme }, { user }) => {
      if (!user) throw new Error('Not authenticated')
      const updated = await User.findByIdAndUpdate(
        user.id,
        { theme },
        { new: true }
      )
      return updated
    },
    addToCollection: async (_, { cardId, setId }, { user }) => {
      if (!user) throw new Error('Not authenticated')
      const updated = await User.findByIdAndUpdate(
        user.id,
        { $addToSet: { collection: { cardId, setId } } },
        { new: true }
      )
      return updated
    },
    removeFromCollection: async (_, { cardId, setId }, { user }) => {
      if (!user) throw new Error('Not authenticated')
      const updated = await User.findByIdAndUpdate(
        user.id,
        { $pull: { collection: { cardId, setId } } },
        { new: true }
      )
      return updated
    },
  },
}