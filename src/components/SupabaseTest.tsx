import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [teacherCount, setTeacherCount] = useState<number | null>(null);
  const [schoolCount, setSchoolCount] = useState<number | null>(null);
  const [bookingCount, setBookingCount] = useState<number | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test the connection by fetching counts from each table
        const { count: teacherCount, error: teacherError } = await supabase
          .from('teachers')
          .select('*', { count: 'exact', head: true });
        
        if (teacherError) throw new Error(`Teacher table error: ${teacherError.message}`);
        setTeacherCount(teacherCount);

        const { count: schoolCount, error: schoolError } = await supabase
          .from('schools')
          .select('*', { count: 'exact', head: true });
        
        if (schoolError) throw new Error(`School table error: ${schoolError.message}`);
        setSchoolCount(schoolCount);

        const { count: bookingCount, error: bookingError } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true });
        
        if (bookingError) throw new Error(`Booking table error: ${bookingError.message}`);
        setBookingCount(bookingCount);

        // If we got here, everything is working
        setConnectionStatus('success');
      } catch (error) {
        console.error('Supabase connection test failed:', error);
        setConnectionStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md mt-10">
      <h2 className="text-xl font-bold mb-4">Supabase Connection Test</h2>
      
      {connectionStatus === 'testing' && (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <p>Testing connection to Supabase...</p>
        </div>
      )}
      
      {connectionStatus === 'success' && (
        <div>
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
            <p className="font-bold">Connection Successful!</p>
            <p>Your Supabase connection is working properly.</p>
          </div>
          
          <div className="space-y-2">
            <p><span className="font-semibold">Teachers:</span> {teacherCount} records</p>
            <p><span className="font-semibold">Schools:</span> {schoolCount} records</p>
            <p><span className="font-semibold">Bookings:</span> {bookingCount} records</p>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>Next steps:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Add sample data to your tables</li>
              <li>Implement authentication</li>
              <li>Start using the services in your components</li>
            </ul>
          </div>
        </div>
      )}
      
      {connectionStatus === 'error' && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p className="font-bold">Connection Error</p>
          <p>{errorMessage}</p>
          <p className="mt-2 text-sm">Please check your Supabase URL and anon key in the .env file.</p>
        </div>
      )}
    </div>
  );
};

export default SupabaseTest; 