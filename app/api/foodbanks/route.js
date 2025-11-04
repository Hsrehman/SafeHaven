import { NextResponse } from "next/server";

const foodBanksData = {
  success: true,
  data: [
    {
      _id: "1",
      name: "North London Food Bank",
      latitude: 51.5514,
      longitude: -0.1577,
      position: { lat: 51.5514, lng: -0.1577 }, // For direct use in Google Maps
      address: "123 Example St, London",
      hours: "Mon-Fri 9AM-5PM",
      phone: "020-1234-5678",
      website: "https://northlondonfoodbank.org",
      halal: true,
      vegetarian: true,
      wheelchairAccessible: true,
      busyTimes: {
        monday: [
          { time: "9AM-11AM", level: "low" },
          { time: "11AM-1PM", level: "medium" },
          { time: "1PM-3PM", level: "high" },
          { time: "3PM-5PM", level: "medium" }
        ],
        tuesday: [
          { time: "9AM-11AM", level: "low" },
          { time: "11AM-1PM", level: "medium" },
          { time: "1PM-3PM", level: "high" },
          { time: "3PM-5PM", level: "low" }
        ],
        wednesday: [
          { time: "9AM-11AM", level: "medium" },
          { time: "11AM-1PM", level: "high" },
          { time: "1PM-3PM", level: "medium" },
          { time: "3PM-5PM", level: "low" }
        ],
        thursday: [
          { time: "9AM-11AM", level: "low" },
          { time: "11AM-1PM", level: "medium" },
          { time: "1PM-3PM", level: "medium" },
          { time: "3PM-5PM", level: "high" }
        ],
        friday: [
          { time: "9AM-11AM", level: "high" },
          { time: "11AM-1PM", level: "high" },
          { time: "1PM-3PM", level: "medium" },
          { time: "3PM-5PM", level: "low" }
        ]
      }
    },
    {
      _id: "2",
      name: "Wandsworth Food Bank",
      latitude: 51.4577,
      longitude: -0.191,
      position: { lat: 51.4577, lng: -0.191 },
      address: "St Mark's Church, Battersea Rise, London SW11 1EJ",
      hours: "Mon-Fri 10AM-4PM",
      phone: "020-8765-4321",
      website: "https://wandsworthfoodbank.org",
      halal: true,
      vegetarian: false,
      wheelchairAccessible: true,
      busyTimes: {
        monday: [
          { time: "10AM-12PM", level: "medium" },
          { time: "12PM-2PM", level: "high" },
          { time: "2PM-4PM", level: "low" }
        ],
        tuesday: [
          { time: "10AM-12PM", level: "low" },
          { time: "12PM-2PM", level: "medium" },
          { time: "2PM-4PM", level: "low" }
        ],
        wednesday: [
          { time: "10AM-12PM", level: "high" },
          { time: "12PM-2PM", level: "high" },
          { time: "2PM-4PM", level: "medium" }
        ],
        thursday: [
          { time: "10AM-12PM", level: "medium" },
          { time: "12PM-2PM", level: "medium" },
          { time: "2PM-4PM", level: "low" }
        ],
        friday: [
          { time: "10AM-12PM", level: "low" },
          { time: "12PM-2PM", level: "medium" },
          { time: "2PM-4PM", level: "high" }
        ]
      }
    },
    {
      _id: "3",
      name: "Newham Food Bank",
      latitude: 51.5155,
      longitude: 0.0352,
      position: { lat: 51.5155, lng: 0.0352 },
      address: "St Mark's Centre, 218 Tollgate Road, Beckton, London E6 5YA",
      hours: "Tue-Sat 9AM-5PM",
      phone: "020-3456-7890",
      website: "https://newhamfoodbank.org",
      halal: true,
      vegetarian: true,
      wheelchairAccessible: false,
      busyTimes: {
        tuesday: [
          { time: "9AM-11AM", level: "low" },
          { time: "11AM-1PM", level: "low" },
          { time: "1PM-3PM", level: "medium" },
          { time: "3PM-5PM", level: "high" }
        ],
        wednesday: [
          { time: "9AM-11AM", level: "low" },
          { time: "11AM-1PM", level: "medium" },
          { time: "1PM-3PM", level: "high" },
          { time: "3PM-5PM", level: "medium" }
        ],
        thursday: [
          { time: "9AM-11AM", level: "medium" },
          { time: "11AM-1PM", level: "high" },
          { time: "1PM-3PM", level: "high" },
          { time: "3PM-5PM", level: "medium" }
        ],
        friday: [
          { time: "9AM-11AM", level: "high" },
          { time: "11AM-1PM", level: "medium" },
          { time: "1PM-3PM", level: "low" },
          { time: "3PM-5PM", level: "low" }
        ],
        saturday: [
          { time: "9AM-11AM", level: "high" },
          { time: "11AM-1PM", level: "high" },
          { time: "1PM-3PM", level: "medium" },
          { time: "3PM-5PM", level: "low" }
        ]
      }
    },
    {
      _id: "4",
      name: "Greenwich Food Bank",
      latitude: 51.4772,
      longitude: 0.0156,
      position: { lat: 51.4772, lng: 0.0156 },
      address: "Fairfield Grove, Charlton, London SE7 8TX",
      hours: "Mon, Wed, Fri 10AM-3PM",
      phone: "020-9876-5432",
      website: "https://greenwichfoodbank.org",
      halal: false,
      vegetarian: true,
      wheelchairAccessible: true,
      busyTimes: {
        monday: [
          { time: "10AM-11:30AM", level: "medium" },
          { time: "11:30AM-1PM", level: "high" },
          { time: "1PM-3PM", level: "low" }
        ],
        wednesday: [
          { time: "10AM-11:30AM", level: "low" },
          { time: "11:30AM-1PM", level: "medium" },
          { time: "1PM-3PM", level: "high" }
        ],
        friday: [
          { time: "10AM-11:30AM", level: "high" },
          { time: "11:30AM-1PM", level: "medium" },
          { time: "1PM-3PM", level: "low" }
        ]
      }
    }
  ]
};

export async function GET() {
  return new Response(JSON.stringify(foodBanksData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Optional: Add support for filtering in the API directly
export async function POST(request) {
  try {
    const { filters } = await request.json();
    
    let filteredData = [...foodBanksData.data];
    
    // Apply filters
    if (filters) {
      if (filters.halal === true) {
        filteredData = filteredData.filter(foodbank => foodbank.halal);
      }
      
      if (filters.vegetarian === true) {
        filteredData = filteredData.filter(foodbank => foodbank.vegetarian);
      }
      
      if (filters.wheelchairAccessible === true) {
        filteredData = filteredData.filter(foodbank => foodbank.wheelchairAccessible);
      }
      
      // Filter by search term if provided
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredData = filteredData.filter(foodbank => 
          foodbank.name.toLowerCase().includes(term) || 
          foodbank.address.toLowerCase().includes(term)
        );
      }
      
      
      if (filters.openNow) {
        
        const now = new Date();
        const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        
        filteredData = filteredData.filter(foodbank => {
          
          return foodbank.hours.toLowerCase().includes(day.substring(0, 3));
        });
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      data: filteredData
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error filtering foodbanks:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error filtering foodbanks'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
