const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jmzo55h.mongodb.net/?retryWrites=true&w=majority`;

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
      
    const servicesCollection = client.db("carDoctor").collection("services");
    const orderCollection = client.db("carDoctor").collection("orders");

    app.get('/services', async (req, res) => {
      const cursor = servicesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        projection: { title: 1, img: 1, price: 1, service_id: 1, img: 1 },
      };
      const result = await servicesCollection.findOne(query, options);
      res.send(result);
    });

    app.get('/checkout', async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { CustomerEmail: req.query.email };
      };
      const result = await orderCollection.find(query).toArray();
      res.send(result);
      
    });

    app.delete('/checkout/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });

    app.patch('/checkout/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedOrder = req.body;
      console.log(updatedOrder);
      const updateDoc = {
        $set: {
          status: updatedOrder.status
        },
      }
      const result = await orderCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.post('/checkout', async (req, res) => {
      const orderItem = req.body;
      console.log(orderItem);
      const result = await orderCollection.insertOne(orderItem)
      res.send(result)
    });

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
    res.send('car doctor server is running');
})

app.listen(port,()=> {
    console.log(`server running on ${port}`)
})