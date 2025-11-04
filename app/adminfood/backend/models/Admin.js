
import mongoose from 'mongoose';

const AdminFoodSchema = new mongoose.Schema({
  ownerName: { type: String, required: true },
  email: { type: String, required: true },
  foodType: [String],
  addressNumber: String,
  addressPostcode: String,
  addressCity: String,
  allowedGenders: [String],
  provideTakeaway: String,
  openOnHolidays: String,
  seatingArrangement: {
    hasSeating: String,
    seatingCapacity: Number
  },
  religionPolicy: {
    allowAllReligions: String,
    allowedReligions: String,
  }
  busyTimes: {
    type: Map,
    of: {
      type: Map,
      of: Number
    }
  },
  contactNumber: String
}, {
  timestamps: true
});

export default mongoose.models.AdminFood || mongoose.model('AdminFood', AdminFoodSchema);