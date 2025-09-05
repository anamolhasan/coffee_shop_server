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

    const database = client.db("coffeeDB");
    const coffeeCollection = database.collection("conceptualCoffees");
    const orderCollection = database.collection("conceptualOrders");
    // const usersCollection = database.collection('conceptualUsers')

    //  get method
    app.get("/coffees", async (req, res) => {
      const allCoffees = await coffeeCollection.find().toArray();
      res.send(allCoffees);
    });

    // single get method
    app.get("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.findOne(query);
      res.send(result);
    });

    // single get method
    app.get("/my-coffees/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await coffeeCollection.find(query).toArray();
      res.send(result);
    });

    // handle like toggle    part 07 conceptual sessions  milestone 11 day 1
    app.patch("/like/:coffeeId", async (req, res) => {
      const id = req.params.coffeeId;
      const filter = { _id: new ObjectId(id) }
      // console.log('id=',filter)
      const email = req.body.email
      // console.log('like je korse tar email=',email)
      const coffee = await coffeeCollection.findOne(filter);
      // console.log('coffee=',coffee)
      //  check if the user has already liked the coffee or not
      const alreadyLiked = coffee?.likedBy.includes(email); 
    //  console.log(
    //     'ekdom shurute like er obostha---> alreadyLiked: ',
    //     alreadyLiked
    //   )
      const updateDoc = alreadyLiked
        ? {
            $pull: {
              // dislike coffee (pop email from liked array)
              likedBy: email,
            },
          }
        : {
            $addToSet: {
              // like coffee (push email in likedBy array)
              likedBy: email,
            },
          };

      await coffeeCollection.updateOne(filter, updateDoc);
      res.send({
        message: alreadyLiked ? "Dislike Successful" : "Like successful",
        liked: !alreadyLiked,
      });
    });

    // handle order
    // save a coffee data in database thorough post request
    app.post("/place-order/:coffeeId", async (req, res) => {
      const id = req.params.coffeeId
      const orderData = req.body.orderData
      const result = await coffeeCollection.insertOne(orderData);
      if(result.acknowledged){
        // update quantity from coffee collection
        await coffeeCollection.updateOne(
          {_id: new ObjectId(id) },
          {
            $inc: {
              quantity: -1
            }
          }
        )
      }


      res.status(201).send(result);
    });

    // post method
    app.post("/coffees", async (req, res) => {
      const newCoffee = req.body
      const quantity = newCoffee.quantity
      newCoffee.quantity = parseInt(quantity)
      const addCoffee = await coffeeCollection.insertOne(newCoffee);
      res.status(201).send(addCoffee);
    });

    app.put("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateCoffee = req.body;
      const updatedDoc = {
        $set: updateCoffee,
      };
      const result = await coffeeCollection.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.delete("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const deletedCoffee = await coffeeCollection.deleteOne(query);
      res.send(deletedCoffee);
    });

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
  res.send("Coffee shop server successfully running");
});

app.listen(port, () => {
  console.log(`Server is listening on port http://localhost:${port}`);
});
