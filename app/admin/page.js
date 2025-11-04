"use client";
import AdminMessaging from "@/components/AdminMessaging";

export default function AdminPage() {
  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <AdminMessaging />
    </div>
  );
}