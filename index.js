const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ulez6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const itemsCollection = client.db('warehouse').collection('items');
        const myitemsCollection = client.db('warehouse').collection('myitems');

        app.get('/item', async (req, res) => {
            const query = {};
            const cursor = itemsCollection.find(query);
            const item = await cursor.toArray();
            res.send(item);
        });
        app.get('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await itemsCollection.findOne(query);
            res.send(item);
        });

        //add new item
        app.post('/item', async (req, res) => {
            const newProduct = req.body;
            console.log('adding new Product', newProduct);
            const result = await itemsCollection.insertOne(newProduct);
            res.send(result);

        });

        //delete item
        app.delete('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await itemsCollection.deleteOne(query);
            res.send(result);
        })

        //update item
        app.put('/item/:id', async (req, res) => {
            const id = req.params.id;
            const updateQuantity = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: updateQuantity.quantity,
                },
            };
            const result = await itemsCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        //add myitem
        app.post('/myitem', async (req, res) => {
            const newMyProduct = req.body;
            console.log('adding new Product', newMyProduct);
            const result = await myitemsCollection.insertOne(newMyProduct);
            res.send(result);

        });

        app.get('/myitem', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = myitemsCollection.find(query);
            const item = await cursor.toArray();
            res.send(item);
        })
    }
    finally {

    }

}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Server Running');
});

app.listen(port, () => {
    console.log('Listening to port', port);
})
