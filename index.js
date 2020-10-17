const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()

const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.eyz9b.mongodb.net/creativeAgencydb?retryWrites=true&w=majority`;

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
app.use(fileUpload());

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const orderCollection = client.db("creativeAgencydb").collection("orders");
    const ReviewCollection = client.db("creativeAgencydb").collection("review");
    const serviceCollection = client.db("creativeAgencydb").collection("services");
    const AdminCollection = client.db("creativeAgencydb").collection("admins");
    app.post('/addOrder', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const task = req.body.task;
        const status = req.body.status;
        const productDetails = req.body.productDetails;
        const price = req.body.price;

        const newImg = file.data;
        const encImg = newImg.toString('base64');
        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        orderCollection.insertOne({ name, email, task, productDetails, price, image, status })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })
    

    app.get('/orders', (req, res) => {
        orderCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    
    app.post('/orders', (req, res) => {
        const email = req.body.email;
        orderCollection.find({email: email})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.patch('/orderUpdate/:id', (req, res) => {
        orderCollection.updateOne({ _id: ObjectId(req.params.id) }, {
            $set: { status: req.body.status },
        })
            .then((result) => {
                res.send(result.modifiedCount > 0)
            })
    })


    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const serviceTitle = req.body.serviceTitle;
        const description = req.body.description;

        const newImg = file.data;
        const encImg = newImg.toString('base64');
        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };
        serviceCollection.insertOne({ serviceTitle, description, image, })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/allServices',(req, res)=>{
        serviceCollection.find({})
        .toArray((err,documents)=>{
            res.send(documents);
        })
    })

    app.post('/addReview', (req, res) => {
        const image = req.body.image;
        const name = req.body.name;
        const companyname = req.body.companyname;
        const description = req.body.description;


        ReviewCollection.insertOne({ name, companyname, description, image })
            .then((result) => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/allReview', (req, res) => {
        ReviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/addAdmin',(req, res)=>{
        const email = req.body.email;
        AdminCollection.insertOne({email})
        .then(result=>{
            res.send(result.insertedCount > 0);
        })
    })
    app.post('/isAdmin',(req, res)=>{
        const email = req.body.email;
        AdminCollection.find({email: email})
        .toArray((err, documents) => {
            if(documents.length > 0){
                res.send(true);
            }
            else{
                res.send(false);
            }
        })
    })

});

app.get('/', (req, res) => {
    res.send("OK")
})

app.listen(process.env.PORT||port)
