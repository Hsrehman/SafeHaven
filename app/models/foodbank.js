import { Schema, model, models } from 'mongoose';

const foodBankSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  location: {
    type: {
      lat: Number,
      lng: Number
    },
    required: true
  },
  hours: String,
  phone: String,
  website: String,
  requirements: String,
  services: [String]
});

export default models.FoodBank || model('FoodBank', foodBankSchema);