const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion,ObjectId} = require('mongodb');

require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

app.get('/', (req,res) => {
    res.send('Hello from whippy ');
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yz4qi.mongodb.net/?retryWrites=true&w=majority`;

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
      client.connect();
    const serviceCollection = client.db('whippy-delivery').collection('services');
    const ordersCollection = client.db('whippy-delivery').collection('orders')

    
   //services 
    app.get('/services', async(req,res)=>{
      const result = await serviceCollection.find({}).toArray();
      res.send(result);
    })
   //single service
    app.get('/services/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const options ={
        projection:{service:1 , image:1, price:1, description:1}
      }
      const result = await serviceCollection.findOne(query,options);
      res.send(result);
    })
    //to order a single service
    app.post('/checkout', async(req,res)=>{
       const checkout = req.body;
       const result = await ordersCollection.insertOne(checkout);
       res.send(result);
    })
    // to show all orders of a specific user
    app.get('/checkout', async(req,res)=>{
      let query = {};
      if(req.query?.email){
        query = {email:req.query.email};
      }
      const result = await ordersCollection.find(query).toArray();
      console.log(result);
      res.send(result);
        
    })
    //delete
    app.delete('/checkout/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await ordersCollection.deleteOne(query);
      res.send(result);
    })


    //to add a new service
    app.post('/addservice', async(req,res)=>{
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    })

    //manage orders : to show all orders
    app.get('/manage', async(req,res) => {
      const result = await ordersCollection.find({}).toArray();
      res.send(result);
    })

    //to update status
    app.patch('/manage/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = { _id: new ObjectId(id)};
      const updatedOrder = req.body;
      console.log(updatedOrder);
      const updateDoc = {
        $set:{
          status: updatedOrder.status
           
        },
      };
      const result = await ordersCollection.updateOne(filter,updateDoc);
      console.log(result);
      res.send(result);
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



app.listen(port, () => {
    console.log('listening to port', port);
})