const handleMigrateTypes = async () => {
  try {
    console.log('Starting migration...');
    const response = await fetch('http://localhost:5000/api/migrate-types', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Migration failed');
    }

    const data = await response.json();
    console.log('Migration response:', data);
    alert(`Migration completed successfully. Updated ${data.updatedCount} laws.`);
  } catch (error) {
    console.error('Migration error:', error);
    alert(`Migration failed: ${error.message}`);
  }
}; 