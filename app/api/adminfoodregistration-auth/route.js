import { NextResponse } from 'next/server';
import dbConnect from '@/app/utils/dbConnect';
import AdminFood from '@/app/adminfood/backend/AdminFood';

export async function POST(request) {
  try {
    console.log('API endpoint hit');
    await dbConnect();
    console.log('Database connected');
   
    const data = await request.json();
    console.log('Raw received data:', data);
    console.log('Food Bank Name from request:', data.foodBankName);
    const adminFood = new AdminFood();
    adminFood.foodBankName = data.foodBankName;
    console.log('Set foodBankName directly:', adminFood.foodBankName);
    adminFood.ownerName = data.ownerName;
    adminFood.email = data.email;
    adminFood.contactNumber = data.contactNumber;
    adminFood.foodType = Array.isArray(data.foodType) ? data.foodType : [];
    adminFood.location = {
      latitude: data.location?.latitude ? parseFloat(data.location.latitude) : null,
      longitude: data.location?.longitude ? parseFloat(data.location.longitude) : null,
      formattedAddress: data.location?.formattedAddress || '',
      dmsNotation: data.location?.dmsNotation || ''
    };
    adminFood.locationType = data.locationType || 'live';
    adminFood.allowedGenders = Array.isArray(data.allowedGenders) ? data.allowedGenders : [];
    adminFood.provideTakeaway = data.provideTakeaway || '';
    adminFood.openOnHolidays = data.openOnHolidays || '';
    adminFood.seatingArrangement = {
      hasSeating: data.seatingArrangement?.hasSeating || 'no',
      seatingCapacity: data.seatingArrangement?.seatingCapacity ? 
        parseInt(data.seatingArrangement.seatingCapacity) : null
    };
    adminFood.religionPolicy = {
      allowAllReligions: data.religionPolicy?.allowAllReligions || 'yes',
      allowedReligions: Array.isArray(data.religionPolicy?.allowedReligions) ? 
        data.religionPolicy.allowedReligions : []
    };
    adminFood.busyTimes = data.busyTimes || {
      MON: { '6am': 0, '9am': 0, '12pm': 0, '3pm': 0, '6pm': 0, '9pm': 0 },
      TUE: { '6am': 0, '9am': 0, '12pm': 0, '3pm': 0, '6pm': 0, '9pm': 0 },
      WED: { '6am': 0, '9am': 0, '12pm': 0, '3pm': 0, '6pm': 0, '9pm': 0 },
      THU: { '6am': 0, '9am': 0, '12pm': 0, '3pm': 0, '6pm': 0, '9pm': 0 },
      FRI: { '6am': 0, '9am': 0, '12pm': 0, '3pm': 0, '6pm': 0, '9pm': 0 },
      SAT: { '6am': 0, '9am': 0, '12pm': 0, '3pm': 0, '6pm': 0, '9pm': 0 },
      SUN: { '6am': 0, '9am': 0, '12pm': 0, '3pm': 0, '6pm': 0, '9pm': 0 }
    };
    console.log('Before save, foodBankName =', adminFood.foodBankName);
    const savedFood = await adminFood.save();
    console.log('After save, foodBankName =', savedFood.foodBankName);
    const fetchedFood = await AdminFood.findById(savedFood._id);
    console.log('After fetch, foodBankName =', fetchedFood.foodBankName);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Registration successful',
      data: savedFood 
    }, { 
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    console.error('Error details:', error.message);
    let errorMessage = 'Registration failed';
    if (error.code === 11000) {
      errorMessage = 'A food bank with this email already exists';
    } else if (error.name === 'ValidationError') {
      errorMessage = Object.values(error.errors).map(err => err.message).join(', ');
      console.error('Validation errors:', error.errors);
      if (error.errors && error.errors.foodBankName) {
        console.error('foodBankName validation error:', error.errors.foodBankName);
      }
    }

    return NextResponse.json({ 
      success: false, 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { 
      status: error.code === 11000 ? 409 : 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}