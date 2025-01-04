require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 4000;

// const corsConfig = {
//   origin: "*",
//   credential: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE']
// }

// middleware
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Enable CORS
app.use(cors());
app.use(express.json());
// app.use(cors({
//   origin: 'https://e-tutor-4ed42.web.app', // Replace with your React app's URL
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Specify allowed methods
//   credentials: true, // If using cookies/auth headers
// }));


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.omdcb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // created database
    const db = client.db('eTutor')
    const tutorialsCollection = db.collection('language')
    const bookedTutorCollection = db.collection('bookedTutor')

    // save tutorial data in db
    app.post('/add-tutorial', async (req, res) => {
      const tutorialData = req.body
      const result = await tutorialsCollection.insertOne(tutorialData)
      res.send(result)
    })

    // get all tutorials added by a specific tutor
    app.get('/tutorials/:email', async (req, res) => {
      const email = req.params.email
      const query = { 'email': email }
      const result = await tutorialsCollection.find(query).toArray()
      res.send(result)
    })

    // get a single tutorial data by id from db to show on update data form
    app.get('/tutorial/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await tutorialsCollection.findOne(query)
      res.send(result)
    })

    // get a single tutorial data by id from db to show totor details
    app.get('/tutor/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await tutorialsCollection.findOne(query)
      res.send(result)
    })

    // updating a single data
    app.put('/update-tutorial/:id', async (req, res) => {
      const id = req.params.id
      const tutorialData = req.body
      const updated = {
        // $set is a mongodb operator
        $set: tutorialData,
      }
      const query = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const result = await tutorialsCollection.updateOne(query, updated, options)
      res.send(result)
    })

    // delete single tutorial api
    app.delete('/tutorial-delete/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await tutorialsCollection.deleteOne(query)
      res.send(result)
    })

    // get all tutor data api
    app.get('/all-tutor', async (req, res) => {
      const result = await tutorialsCollection.find().toArray()
      res.send(result)
    })

    // save booked Tutor data in db
    app.post('/book-tutor', async (req, res) => {
      const bookedTutorData = req.body
      const result = await bookedTutorCollection.insertOne(bookedTutorData)
      res.send(result)
    })

    // get all booked data by specific user
    app.get('/myBooked-tutor/:email', async (req, res) => {
      const email = req.params.email
      const query = { 'email': email }
      const result = await bookedTutorCollection.find(query).toArray()
      res.send(result)
    })

    // Increment Review Api
    app.patch('/review-inc/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const updated = {
        $inc: { review: 1 }
      }
      const result = await tutorialsCollection.updateOne(filter, updated)
      res.send(result)
    })

    // getting all language and photo by combining data once api
    app.get('/languages-photos', async (req, res) => {
      const result = await tutorialsCollection.aggregate([
        {
          $group: {
              _id: "$language", // Group by language
              tutorialPhoto: { $first: "$tutorialPhoto" } // Pick the first photo for each language
          },
      },
      {
          $project: {
              _id: 0,
              language: "$_id",
              tutorialPhoto: 1
          },
      },
      ]).toArray();
      const response = result.map(item => ({
        language: item.language,
        tutorialPhoto: item.tutorialPhoto
    }));
    console.log(response);
    res.send(response); // Send combined languages and photos as a single array of objects
    })

    // get all data for search functionality
    app.get('/all-tutorials-search', async(req, res)=>{
      const filter = req.query.filter
      const search = req.query.search
      // let query = {language: filter}
      let query = {language: {
        // using regex we can have data if match with one letter of the whole word in the language value
        // case insensetive korar jonno $options operator use korte hobe
        $regex: search, $options: 'i'
      }}
      //getting data by category as language
      if(filter) query.language = filter

      const result = await tutorialsCollection.find(query).toArray()
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('e tutor server is running')
})

app.listen(port, () => {
  console.log(`e tutor server is running on port: ${port}`)
})