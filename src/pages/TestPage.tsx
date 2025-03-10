import React from 'react';
import SupabaseTest from '@/components/SupabaseTest';
import SeedDataButton from '@/components/SeedDataButton';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Tebase CRM - Supabase Integration Test
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            This page tests the connection to your Supabase backend.
          </p>
        </div>
        
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <SupabaseTest />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4">Sample Data</h2>
            <p className="text-gray-600 mb-4">
              Click the button below to add sample data to your Supabase database. This will create:
            </p>
            <ul className="list-disc pl-5 mb-6 text-gray-600">
              <li>3 teachers with detailed profiles</li>
              <li>3 schools with contact information</li>
              <li>3 bookings connecting teachers with schools</li>
            </ul>
            <SeedDataButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage; 