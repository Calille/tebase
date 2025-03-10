import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { runSeed } from '@/scripts/seedData';

const SeedDataButton = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{
    success?: boolean;
    error?: string;
  } | null>(null);

  const handleSeedData = async () => {
    try {
      setIsSeeding(true);
      setSeedResult(null);
      
      const result = await runSeed();
      setSeedResult(result);
    } catch (error) {
      setSeedResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleSeedData} 
        disabled={isSeeding}
        className="w-full"
      >
        {isSeeding ? 'Adding Sample Data...' : 'Add Sample Data to Database'}
      </Button>
      
      {seedResult && (
        <Alert variant={seedResult.success ? "default" : "destructive"}>
          <AlertTitle>
            {seedResult.success ? 'Success!' : 'Error'}
          </AlertTitle>
          <AlertDescription>
            {seedResult.success 
              ? 'Sample data has been successfully added to your database.' 
              : `Failed to add sample data: ${seedResult.error}`}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SeedDataButton; 