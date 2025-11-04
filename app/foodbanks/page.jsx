'use client';
import FoodBankMap from '@/app/components/FoodBankMap';

export default function FoodBanksPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Greater London Food Banks
        </h1>
        <div className="bg-white rounded-lg shadow-lg p-4">
          <FoodBankMap />
        </div>
      </div>
    </main>
  );
}