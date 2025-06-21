import mongoose from 'mongoose'
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  theme: { type: String, default: 'default' },
  collection: {
    type: [
      {
        cardId: String,
        setId: String,
      }
    ],
    default: [],
  },
})
export default mongoose.model('User', userSchema)