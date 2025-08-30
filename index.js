const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URL, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const coffeeCollection = client.db("coffeeDB").collection("recapCoffees");
    const usersCollection = client.db('coffeeDB').collection('recapUsers')

    app.get("/coffees", async (req, res) => {
      const result = await coffeeCollection.find().toArray();
      res.send(result);
    });

    app.get("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.findOne(query);
      res.send(result);
    });

    app.post("/coffees", async (req, res) => {
      const newCoffee = req.body;
      // console.log(newCoffee)

      const result = await coffeeCollection.insertOne(newCoffee);
      res.send(result);
    });

    app.put("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = {upsert:true}
      const updatedCoffee = req.body
      const updatedDoc = {
        $set:updatedCoffee
      }
      const result = await coffeeCollection.updateOne(filter, updatedDoc, options)
      res.send(result)
    });

    app.delete("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    });



    // user related apis in the database 

    // user get method
    app.get('/users', async(req, res) => {
      const result = await usersCollection.find().toArray()
      res.send(result)
    })
    // user post method
    app.post('/users', async(req, res) => {
      const userProfile = req.body
      const result = await usersCollection.insertOne(userProfile)
      res.send(result)
    })
    // user delete method
    app.delete('/users/:id', async(req, res) => {
       const id = req.params.id
       const query = {_id: new ObjectId(id)}
       const result = await usersCollection.deleteOne(query)
       res.send(result)
    })

    

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is listening on port http://localhost:${port}`);
});
