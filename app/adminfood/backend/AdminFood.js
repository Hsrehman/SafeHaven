import mongoose from 'mongoose';

const AdminFoodSchema = new mongoose.Schema({
  foodBankName: {
    type: String,
    required: [true, 'Please provide a food bank name'],
    trim: true
  },
  ownerName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  foodType: [{
    type: String,
    required: true
  }],
 
 location: {
  latitude: { type: Number },
  longitude: { type: Number },
  formattedAddress: { type: String },
  dmsNotation: { type: String }
},

// Add these fields for manual address if needed
locationType: { type: String, enum: ['live', 'manual'], default: 'live' },
manualAddress: { type: String },
manualCity: { type: String },
manualPostcode: { type: String },
manualState: { type: String },
manualCountry: { type: String },

  allowedGenders: [{
    type: String,
    required: true
  }],
  provideTakeaway: {
    type: String,
    required: true
  },
  openOnHolidays: {
    type: String,
    required: true
  },
  seatingArrangement: {
    hasSeating: String,
    seatingCapacity: Number
  },
  religionPolicy: {
    allowAllReligions: String,
    allowedReligions: [String]
  },
  busyTimes: {
    MON: { type: Map, of: Number },
    TUE: { type: Map, of: Number },
    WED: { type: Map, of: Number },
    THU: { type: Map, of: Number },
    FRI: { type: Map, of: Number },
    SAT: { type: Map, of: Number },
    SUN: { type: Map, of: Number }
  },
  contactNumber: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const AdminFood = mongoose.models.AdminFood || mongoose.model('AdminFood', AdminFoodSchema);
export default AdminFood;