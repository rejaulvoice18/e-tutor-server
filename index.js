require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 4000;

// middleware

app.use(cors());
app.use(express.json());
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');





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
    await client.connect();

    // created database
    const db = client.db('eTutor')
    const tutorialsCollection = db.collection('language')

    // save tutorial data in db
    app.post('/add-tutorial', async (req, res)=>{
        const tutorialData = req.body
        const result = await tutorialsCollection.insertOne(tutorialData)
        console.log(result)
        res.send(result)
    })

    // get all tutorials added by a specific tutor
    app.get('/tutorials/:email', async (req, res)=>{
        const email = req.params.email
        const query = { 'email': email }
        const result = await tutorialsCollection.find(query).toArray()
        console.log(result)
        res.send(result)
    })

    // get a single tutorial data by id from db to show on update data form
    app.get('/tutorial/:id', async (req, res)=>{
        const id = req.params.id
        const query = { _id: new ObjectId(id) }
        const result = await tutorialsCollection.findOne(query)
        res.send(result)
    })

    // updating a single data
    app.put('/update-tutorial/:id', async (req, res)=>{
        const id = req.params.id
        const tutorialData = req.body
        const updated = {
            // $set is a mongodb operator
            $set: tutorialData,
        }
        const query = { _id: new ObjectId(id) }
        const options = { upsert: true}
        const result = await tutorialsCollection.updateOne(query, updated, options)
        res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res)=> {
    res.send('e tutor server is running')
})

app.listen(port, ()=>{
    console.log(`e tutor server is running on port: ${port}`)
})