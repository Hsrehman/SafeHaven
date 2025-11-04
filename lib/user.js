import { Schema, model, models } from 'mongoose';


//user schema

const userSchema = new Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    minLength: [2, 'Full name must be at least 2 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default models.User || model('User', userSchema);