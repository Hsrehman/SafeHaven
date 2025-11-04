import { Schema, model, models } from 'mongoose';

export const postSchema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'general-tips'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  createdBy: {
    firstName: String,
    lastName: String,
    isAnonymous: Boolean,
    userId: String
  }
}, {
  collection: 'posts' 
});

export default models.Post || model('Post', postSchema);