const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
app.use(express.json());

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'testdb';
const client = new MongoClient(uri);


// Input Validation Helper
function validateProfileInput(body, requireAllFields = true) {
    const { name, email, city } = body;
    if (requireAllFields && (!name || !email || !city)) return false;
    if ((name !== undefined && typeof name !== "string") ||
        (email !== undefined && typeof email !== "string") ||
        (city !== undefined && typeof city !== "string")) return false;
    if (
        (name !== undefined && !name.trim()) ||
        (email !== undefined && !email.trim()) ||
        (city !== undefined && !city.trim())
    ) return false;
    return true;
}

// MongoDB connection middleware
async function connectDb(req, res, next) {
    if (!client.isConnected && !client.topology?.isConnected()) {
        try {
            await client.connect();
        } catch (err) {
            return res.status(500).json({ status: 'error', message: 'DB connection error', err: err.message });
        }
    }
    req.db = client.db(dbName);
    next();
}

app.use(connectDb);

// GET all profiles (omit _id)
app.get('/profiles', async (req, res) => {
    const profiles = await req.db.collection('profile').find({}, { projection: { _id: 0, name: 1, email: 1, city: 1 } }).toArray();
    res.json({ status: 'success', profiles });
});

// POST: create new profile
app.post('/profiles', async (req, res) => {
    if (!validateProfileInput(req.body)) {
        return res.status(400).json({ status: 'error', message: 'Invalid input. All fields required and must be non-empty strings.' });
    }
    const { name, email, city } = req.body;
    try {
        const result = await req.db.collection('profile').insertOne({ name, email, city });
        res.json({
            status: 'success',
            insertedId: result.insertedId,
            profile: { name, email, city }
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Failed to insert', err: err.message });
    }
});

// PUT: update profile by name
app.put('/profiles/:name', async (req, res) => {
    if (!validateProfileInput(req.body, false)) {
        return res.status(400).json({ status: 'error', message: 'Invalid input. Email/city fields must be non-empty strings.' });
    }
    const filter = { name: req.params.name };
    const updateFields = {};
    if (req.body.email) updateFields.email = req.body.email;
    if (req.body.city) updateFields.city = req.body.city;
    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ status: 'error', message: 'Nothing to update.' });
    }

    const result = await req.db.collection('profile').findOneAndUpdate(
        filter,
        { $set: updateFields },
        { returnDocument: 'after', projection: { _id: 0, name: 1, email: 1, city: 1 } }
    );
    if (result.value) {
        res.json({ status: 'success', updated: result.value });
    } else {
        res.status(404).json({ status: 'error', message: 'Profile not found.' });
    }
});

// DELETE: by name
app.delete('/profiles/:name', async (req, res) => {
    const result = await req.db.collection('profile').deleteOne({ name: req.params.name });
    if (result.deletedCount) {
        res.json({ status: 'success', message: `Profile '${req.params.name}' deleted.` });
    } else {
        res.status(404).json({ status: 'error', message: 'Profile not found.' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
