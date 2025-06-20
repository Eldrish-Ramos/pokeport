import mongoose from 'mongoose'
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  theme: { type: String, default: 'default' },
})
export default mongoose.model('User', userSchema)