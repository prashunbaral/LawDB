// Import necessary modules
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';

// Initialize Express
const app = express();
const port = 5000;

// Middleware to parse JSON bodies
app.use(cors());
app.use(bodyParser.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// MongoDB connection with enhanced options
mongoose.connect('mongodb+srv://pram15karki:DSSUJttfiBLkY96b@cluster0.svtnj.mongodb.net/nepal_law', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('MongoDB Connected Successfully');
})
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});

// Define the schema for the "laws" collection with validation
const lawSchema = new mongoose.Schema({
  law_id: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['civil', 'criminal', 'constitutional', 'commercial']
  },
  type: {
    mainType: {
      type: String,
      required: true,
      enum: ['मौजूदा कानून', 'संविधान', 'ऐन', 'अध्यक्ष', 'नियमावली', '(गठन) आदेश']
    },
    subType: {
      type: String,
      enum: ['हालसालैका ऐन', 'खण्ड अनुसार', 'खण्ड बाहेकका ऐन', 'वर्गीकरण अनुसारको सूची'],
      default: null
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { 
  collection: 'laws',
  timestamps: true 
});

// Create a Mongoose model for laws
const Law = mongoose.model('Law', lawSchema);

// Define the schema for the counters collection
const counterSchema = new mongoose.Schema({
  _id: String,  // The name of the counter (e.g., "law_id")
  sequence_value: Number,
});

// Create a Mongoose model for counters
const Counter = mongoose.model('Counter', counterSchema);

// Function to get the next sequence value for law_id
const getNextLawId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { _id: 'law_id' },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true } // Create counter if not exist
  );
  return counter.sequence_value;
};

// Function to query laws based on category and search term
const getLaws = async (query, category, type) => {
  try {
    // If category is "all", we skip filtering by category
    const filter = {};
    if (category && category !== 'all') {
      filter.category = new RegExp(category, 'i');
    }
    if (type && type !== 'all') {
      filter.type = type;
    }
    
    const laws = await Law.find({
      ...filter,
      $or: [
        { title: { $regex: new RegExp(query, 'i') } },
        { description: { $regex: new RegExp(query, 'i') } },
      ]
    });
    return laws;
  } catch (err) {
    console.error('Error fetching laws:', err);
    return [];
  }
};

// Get a single law by ID
app.get('/api/laws/:id', async (req, res) => {
  const { id } = req.params;
  let law = null;
  try {
    law = await Law.findOne({ law_id: Number(id) });
    if (!law) {
      law = await Law.findOne({ law_id: id });
    }
    if (!law) {
      return res.status(404).json({ message: 'Law not found' });
    }
    return res.status(200).json(law);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all laws with optional search and category filter
app.get('/api/laws', async (req, res) => {
    const { query = "", category = "", type = "", subType = "" } = req.query;
    console.log('Received query:', query);
    console.log('Received category:', category);
    console.log('Received type:', type);
    console.log('Received subType:', subType);
  
    try {
      let searchQuery = {};
      
      // If there's a category filter, add it to the search query
      if (category && category !== 'all') {
        searchQuery.category = category.toLowerCase();
      }
      
      // If there's a type filter, add it to the search query
      if (type) {
        searchQuery['type.mainType'] = type;
        if (subType) {
          searchQuery['type.subType'] = subType;
        }
      }
      
      // If there's a search query, search in both title and description
      if (query) {
        searchQuery.$or = [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ];
      }
  
      console.log('MongoDB search query:', searchQuery);
  
      // Query MongoDB with the constructed searchQuery
      const laws = await Law.find(searchQuery);
      console.log('Laws found with search query:', laws);
  
      res.json(laws);
    } catch (err) {
      console.error('Error:', err);
      res.status(500).send('Server error');
    }
});

// Create a new law
app.post('/api/laws', async (req, res) => {
  const { title, description, category, type } = req.body;

  if (!title || !description || !category || !type?.mainType) {
    return res.status(400).json({ message: 'All required fields are missing' });
  }

  try {
    // Get the next law_id from the counter
    const law_id = await getNextLawId();

    // Create a new law with the incremented law_id
    const newLaw = new Law({ law_id, title, description, category, type });
    await newLaw.save();
    res.status(201).json(newLaw);
  } catch (err) {
    console.error('Error creating law:', err);
    res.status(500).send('Server error');
  }
});

// Update an existing law
app.put('/api/laws/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, type } = req.body;

    // Convert id to number
    const lawId = parseInt(id, 10);
    if (isNaN(lawId)) {
      return res.status(400).json({ message: 'Invalid law ID' });
    }

    // Find the law first
    const existingLaw = await Law.findOne({ law_id: lawId });
    if (!existingLaw) {
      return res.status(404).json({ message: 'Law not found' });
    }

    // Update the law
    existingLaw.title = title;
    existingLaw.description = description;
    existingLaw.category = category;
    existingLaw.type = type;

    // Save the updated law
    const updatedLaw = await existingLaw.save();
    console.log('Successfully updated law:', updatedLaw);
    res.json(updatedLaw);
  } catch (err) {
    console.error('Error updating law:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a law with enhanced error handling
app.delete('/api/laws/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Delete request received for ID:', id);

    // Validate ID
    if (!id || isNaN(parseInt(id, 10))) {
      console.log('Invalid law ID:', id);
      return res.status(400).json({ 
        message: 'Invalid law ID',
        details: 'The provided ID must be a valid number'
      });
    }

    const lawId = parseInt(id, 10);

    // First check if the law exists
    const existingLaw = await Law.findOne({ law_id: lawId });
    if (!existingLaw) {
      console.log('No law found with ID:', lawId);
      return res.status(404).json({ 
        message: 'Law not found',
        details: `No law found with ID: ${lawId}`
      });
    }

    // Delete the law
    const result = await Law.deleteOne({ law_id: lawId });
    console.log('Delete result:', result);

    if (result.deletedCount === 0) {
      console.log('Failed to delete law with ID:', lawId);
      return res.status(500).json({ 
        message: 'Failed to delete law',
        details: 'The law was found but could not be deleted'
      });
    }

    console.log('Successfully deleted law with ID:', lawId);
    res.json({ 
      message: 'Law deleted successfully',
      deletedLawId: lawId,
      details: `Law with ID ${lawId} has been deleted`
    });
  } catch (err) {
    console.error('Error in delete operation:', err);
    res.status(500).json({ 
      message: 'Server error',
      error: err.message,
      details: 'An unexpected error occurred while deleting the law'
    });
  }
});

// Add this endpoint to migrate existing laws - place it BEFORE any other route handlers
app.post('/api/migrate-types', async (req, res) => {
  console.log('Migration endpoint hit');
  try {
    console.log('Starting migration...');
    
    // Get the raw MongoDB collection
    const collection = mongoose.connection.collection('laws');
    
    // Find all laws that need migration
    const laws = await collection.find({ type: { $exists: false } }).toArray();
    console.log(`Found ${laws.length} laws to migrate`);
    
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    // Process each law
    for (const law of laws) {
      try {
        console.log(`Processing law ${law.law_id} with category: ${law.category}`);
        
        let newCategory = law.category;
        
        // Map 'corporate' to 'commercial' if needed
        if (law.category === 'corporate') {
          console.log(`Mapping category from 'corporate' to 'commercial' for law ${law.law_id}`);
          newCategory = 'commercial';
        }
        
        // Ensure category is one of the allowed values
        if (!['civil', 'criminal', 'constitutional', 'commercial'].includes(newCategory)) {
          console.log(`Invalid category '${newCategory}' for law ${law.law_id}, defaulting to 'civil'`);
          newCategory = 'civil';
        }

        // Use MongoDB's native updateOne operation
        const result = await collection.updateOne(
          { _id: law._id },
          { 
            $set: {
              category: newCategory,
              type: {
                mainType: 'मौजूदा कानून',
                subType: null
              }
            }
          }
        );

        if (result.modifiedCount > 0) {
          console.log(`Successfully migrated law ${law.law_id}`);
          successCount++;
        } else if (result.matchedCount > 0) {
          console.log(`No changes needed for law ${law.law_id}`);
          skippedCount++;
        } else {
          console.log(`Failed to find law ${law.law_id} for update`);
          errorCount++;
        }
      } catch (saveError) {
        console.error(`Error updating law ${law.law_id}:`, saveError);
        errorCount++;
        // Continue with other laws even if one fails
        continue;
      }
    }
    
    // After migration, verify the changes
    const updatedLaws = await collection.find({ type: { $exists: true } }).toArray();
    console.log(`Verification: ${updatedLaws.length} laws now have type field`);
    
    console.log('Migration completed successfully');
    res.json({ 
      message: 'Migration completed successfully',
      updatedCount: successCount,
      skippedCount: skippedCount,
      errorCount: errorCount,
      totalMigrated: updatedLaws.length
    });
  } catch (err) {
    console.error('Migration error:', err);
    res.status(500).json({ 
      message: 'Migration failed',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Add this endpoint right after the MongoDB connection setup and before other routes
app.post('/api/reset-database', async (req, res) => {
  console.log('Reset database endpoint hit');
  try {
    // Get the raw MongoDB collection
    const collection = mongoose.connection.collection('laws');
    
    // Clear all documents from the collection
    await collection.deleteMany({});
    console.log('Database cleared successfully');

    // Add sample laws with correct structure
    const sampleLaws = [
      {
        law_id: 1,
        title: "Civil Code of Nepal",
        description: "The main civil code governing civil matters in Nepal",
        category: "civil",
        type: {
          mainType: "मौजूदा कानून",
          subType: null
        },
        createdAt: new Date()
      },
      {
        law_id: 2,
        title: "Criminal Code of Nepal",
        description: "The main criminal code governing criminal matters in Nepal",
        category: "criminal",
        type: {
          mainType: "मौजूदा कानून",
          subType: null
        },
        createdAt: new Date()
      },
      {
        law_id: 3,
        title: "Constitution of Nepal",
        description: "The supreme law of Nepal",
        category: "constitutional",
        type: {
          mainType: "संविधान",
          subType: null
        },
        createdAt: new Date()
      },
      {
        law_id: 4,
        title: "Commercial Law of Nepal",
        description: "Laws governing commercial activities in Nepal",
        category: "commercial",
        type: {
          mainType: "मौजूदा कानून",
          subType: null
        },
        createdAt: new Date()
      }
    ];

    // Insert sample laws
    const result = await collection.insertMany(sampleLaws);
    console.log(`Added ${result.insertedCount} sample laws`);

    res.json({
      message: 'Database reset successful',
      cleared: true,
      sampleLawsAdded: result.insertedCount
    });
  } catch (err) {
    console.error('Database reset error:', err);
    res.status(500).json({
      message: 'Database reset failed',
      error: err.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('Available routes:');
  console.log('- POST /api/migrate-types');
  console.log('- GET /api/laws');
  console.log('- POST /api/laws');
  console.log('- PUT /api/laws/:id');
  console.log('- DELETE /api/laws/:id');
});
