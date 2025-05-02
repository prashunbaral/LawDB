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
const getLaws = async (query, category) => {
  try {
    // If category is "all", we skip filtering by category
    const filter = category && category !== 'all' ? { category: new RegExp(category, 'i') } : {};
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
    const { query = "", category = "" } = req.query;
    console.log('Received query:', query);
    console.log('Received category:', category);
  
    try {
      let searchQuery = {};
      
      // If there's a category filter, add it to the search query
      if (category && category !== 'all') {
        searchQuery.category = category.toLowerCase();
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
  const { title, description, category } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Get the next law_id from the counter
    const law_id = await getNextLawId();

    // Create a new law with the incremented law_id
    const newLaw = new Law({ law_id, title, description, category });
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
    const { title, description, category } = req.body;

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
});
