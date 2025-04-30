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

// MongoDB connection
mongoose.connect('mongodb+srv://pram15karki:DSSUJttfiBLkY96b@cluster0.svtnj.mongodb.net/nepal_law', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });

// Define the schema for the "laws" collection
const lawSchema = new mongoose.Schema({
  law_id: Number,
  title: String,
  description: String,
  category: String,
}, { collection: 'laws' });

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
      
      // If there's a search query, search in both title and description
      if (query) {
        searchQuery = {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
          ]
        };
      }
      
      // If there's a category filter, add it to the search query
      if (category && category !== 'all') {
        searchQuery = {
          ...searchQuery,
          category: { $regex: category, $options: 'i' }
        };
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
  const { id } = req.params;
  const { law_id, title, description, category } = req.body;

  if (!law_id || !title || !description || !category) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const updatedLaw = await Law.findByIdAndUpdate(
      id,
      { law_id, title, description, category },
      { new: true }
    );
    if (!updatedLaw) {
      return res.status(404).json({ message: 'Law not found' });
    }
    res.json(updatedLaw);
  } catch (err) {
    console.error('Error updating law:', err);
    res.status(500).send('Server error');
  }
});

// Delete a law
app.delete('/api/laws/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedLaw = await Law.findByIdAndDelete(id);
    if (!deletedLaw) {
      return res.status(404).json({ message: 'Law not found' });
    }
    res.json({ message: 'Law deleted successfully' });
  } catch (err) {
    console.error('Error deleting law:', err);
    res.status(500).send('Server error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
