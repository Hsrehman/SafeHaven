"use client";
import { useEffect, useState } from "react";

export default function ProfileDashboard() {
  const [profile, setProfile] = useState({
    name: "N/A",
    email: "N/A",
    foodType: "N/A",
    address: {
      number: "N/A",
      street: "N/A",
      postcode: "N/A",
    },
    takeawayContainers: "N/A",
    openOnHolidays: "N/A",
    seatingAvailable: "N/A",
    allowsAllReligions: "N/A",
    busiestTime: "N/A",
  });

  const fetchData = async () => {
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ display: "flex", background: "#f8f9fa", minHeight: "100vh", color: "#333" }}>
      <div style={{
        width: "200px",
        background: "#1e3a8a",
        color: "white",
        padding: "15px",
        position: "fixed",
        top: "60px",
        left: "0",
        bottom: "60px",
        borderRadius: "0 10px 10px 0",
        overflowY: "auto"
      }}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "15px" }}>Safe Haven</h2>
        <nav>
          <ul style={{ listStyle: "none", padding: "0" }}>
            <li style={{ padding: "10px", background: "#2c5282", borderRadius: "5px", marginBottom: "10px", textAlign: "center", cursor: "pointer" }}>Dashboard</li>
            <li style={{ padding: "10px", background: "#2c5282", borderRadius: "5px", cursor: "pointer" }}>Settings</li>
          </ul>
        </nav>
      </div>

      <div style={{ flex: "1", marginLeft: "220px", padding: "30px", height: "100vh", overflowY: "auto" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          marginTop: "30px",
          padding: "0 20px"
        }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center", flexGrow: "1" }}>Food Bank Admin Dashboard</h1>
          <div>
            <button style={{ background: "#1e3a8a", color: "white", padding: "8px 15px", borderRadius: "5px", marginRight: "10px", border: "none", cursor: "pointer" }}>Notifications</button>
            <button style={{ background: "#6c757d", color: "white", padding: "8px 15px", borderRadius: "5px", border: "none", cursor: "pointer" }}>Logout</button>
          </div>
        </div>

        <div className="p-4">
          <button 
            onClick={fetchData} 
            style={{
              background: "#28a745",
              color: "white",
              padding: "8px 15px",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
              marginBottom: "20px"
            }}
          >
            Refresh Data
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginBottom: "25px" }}>
          <div style={{ background: "#ffebcc", padding: "15px", borderRadius: "8px" }}>
            <h2>Name</h2>
            <p>{profile.name}</p>
          </div>
          <div style={{ background: "#cce5ff", padding: "15px", borderRadius: "8px" }}>
            <h2>Email</h2>
            <p>{profile.email}</p>
          </div>
          <div style={{ background: "#e6ccff", padding: "15px", borderRadius: "8px" }}>
            <h2>Busiest Time</h2>
            <p>{profile.busiestTime}</p>
          </div>
        </div>

        <div style={{ background: "#d9f7be", padding: "15px", borderRadius: "8px" }}>
          <h2>Type of Food Served</h2>
          <p>{profile.foodType}</p>
        </div>

        <div style={{ background: "#ffd6e7", padding: "15px", borderRadius: "8px", marginTop: "15px" }}>
          <h2>Address</h2>
          <p><strong>Number:</strong> {profile.address.number}</p>
          <p><strong>Street:</strong> {profile.address.street}</p>
          <p><strong>Postcode:</strong> {profile.address.postcode}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginTop: "15px" }}>
          <div style={{ background: "#ffeeba", padding: "15px", borderRadius: "8px" }}>
            <h2>Takeaway Containers</h2>
            <p>{profile.takeawayContainers}</p>
          </div>
          <div style={{ background: "#ccffcc", padding: "15px", borderRadius: "8px" }}>
            <h2>Open on Public Holidays</h2>
            <p>{profile.openOnHolidays}</p>
          </div>
          <div style={{ background: "#ffb3b3", padding: "15px", borderRadius: "8px" }}>
            <h2>Seating Available</h2>
            <p>{profile.seatingAvailable}</p>
          </div>
        </div>

        <div style={{ background: "#b3e0ff", padding: "15px", borderRadius: "8px", marginTop: "15px" }}>
          <h2>Allows All Religions</h2>
          <p>{profile.allowsAllReligions}</p>
        </div>
      </div>
    </div>
  );
}
