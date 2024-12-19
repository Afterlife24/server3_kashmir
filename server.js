// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const { MongoClient, ObjectId } = require('mongodb');
// const app = express();

// const corsOptions = {
//     origin: ['https://scanme-kashmir.gofastapi.com', 'https://client-kashmir.gofastapi.com'], // Replace with actual frontends
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
// };

// app.use(cors(corsOptions));
// app.use(bodyParser.json());

// let db;

// // Connect to MongoDB
// const uri = "mongodb+srv://Dhanush6371:Dhanush2002@cluster0.kozns.mongodb.net/Dhanush6371?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// client.connect()
//     .then(() => {
//         db = client.db('Dhanush6371'); // Replace 'restaurant' with your database name
//         console.log("Connected to MongoDB");
//     })
//     .catch(err => {
//         console.error("Error connecting to MongoDB:", err);
//     });

// // Endpoint to send the order
// app.post("/sendOrder", async (req, res) => {
//     const tableNumber = String(req.query.table_num || req.body.tableNumber).trim();
//     const { dishes, tokenId } = req.body;

//     if (!tableNumber || isNaN(tableNumber)) {
//         return res.status(400).json({ error: "A valid table number is required" });
//     }

//     const newOrder = {
//         tableNumber,
//         dishes,
//         createdAt: new Date(),
//         isDelivered: false,
//         tokenId
//     };

//     try {
//         const result = await db.collection('orders').insertOne(newOrder);
//         res.status(200).json({ message: "Order received successfully", tokenId, orderId: result.insertedId });
//     } catch (error) {
//         res.status(500).json({ error: "Error: " + error.message });
//     }
// });

// // Endpoint to mark an order as delivered
// app.post("/markAsDelivered", async (req, res) => {
//     const { orderId } = req.body;

//     if (!orderId) {
//         return res.status(400).json({ error: "Order ID is required" });
//     }

//     try {
//         const result = await db.collection('orders').updateOne(
//             { _id: new ObjectId(orderId) },
//             { $set: { isDelivered: true } }
//         );

//         if (result.matchedCount === 0) {
//             return res.status(404).json({ error: "Order not found" });
//         }

//         res.status(200).json({ message: "Order marked as delivered successfully" });
//     } catch (error) {
//         res.status(500).json({ error: "Error: " + error.message });
//     }
// });

// // Endpoint to reserve a table
// app.post("/reserveTable", async (req, res) => {
//     const { name, phone, date, time, persons } = req.body;

//     const reservation = {
//         name,
//         phone,
//         date,
//         time,
//         persons,
//         createdAt: new Date()
//     };

//     try {
//         const result = await db.collection('reservations').insertOne(reservation);
//         res.status(200).json({ message: "Reservation saved successfully", id: result.insertedId });
//     } catch (error) {
//         res.status(500).json({ error: "Error: " + error.message });
//     }
// });

// // Get orders from the database
// app.get("/getOrders", async (req, res) => {
//     try {
//         const orders = await db.collection('orders').find({}).toArray();
//         res.status(200).json({ orders });
//     } catch (error) {
//         res.status(500).json({ error: "Error: " + error.message });
//     }
// });

// // Get reservations from the database
// app.get("/getReservations", async (req, res) => {
//     try {
//         const reservations = await db.collection('reservations').find({}).toArray();
//         res.status(200).json({ reservations });
//     } catch (error) {
//         res.status(500).json({ error: "Error: " + error.message });
//     }
// });

// // Server-Sent Events route for orders
// app.get('/streamOrders', (req, res) => {
//     res.setHeader('Content-Type', 'text/event-stream');
//     res.setHeader('Cache-Control', 'no-cache');
//     res.setHeader('Connection', 'keep-alive');

//     // Function to send events to the client
//     const sendEvent = (change) => {
//         res.write(`data: ${JSON.stringify(change)}\n\n`);
//     };

//     // Listen to order changes and send to the client
//     const ordersChangeStream = db.collection('orders').watch();
//     ordersChangeStream.on('change', sendEvent);

//     // Cleanup on disconnect
//     req.on('close', () => {
//         ordersChangeStream.removeAllListeners('change');
//     });
// });

// // Server-Sent Events route for reservations
// app.get('/streamReservations', (req, res) => {
//     res.setHeader('Content-Type', 'text/event-stream');
//     res.setHeader('Cache-Control', 'no-cache');
//     res.setHeader('Connection', 'keep-alive');

//     // Function to send events to the client
//     const sendEvent = (change) => {
//         res.write(`data: ${JSON.stringify(change)}\n\n`);
//     };

//     // Listen to reservation changes and send to the client
//     const reservationsChangeStream = db.collection('reservations').watch();
//     reservationsChangeStream.on('change', sendEvent);

//     // Cleanup on disconnect
//     req.on('close', () => {
//         reservationsChangeStream.removeAllListeners('change');
//     });
// });

// // Start server
// // const PORT = 5000;
// // app.listen(PORT, () => {
// //     console.log(`Server is running on http://localhost:${PORT}`);
// // });

// module.exports = app;









const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();

const corsOptions = {
    origin: ['https://scanme-kashmir.gofastapi.com', 'https://client-kashmir.gofastapi.com'], // Replace with actual frontends
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

let db;
let client;

const uri = "mongodb+srv://Dhanush6371:Dhanush2002@cluster0.kozns.mongodb.net/Dhanush6371?retryWrites=true&w=majority";

// Connect to MongoDB with reconnection logic
async function connectToMongo() {
    try {
        if (!client || !client.isConnected()) {
            client = new MongoClient(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
                socketTimeoutMS: 45000,        // Close sockets after 45 seconds
                keepAlive: true,               // Enable keep-alive
            });
            await client.connect();
            db = client.db('Dhanush6371'); // Replace 'Dhanush6371' with your database name
            console.log('Connected to MongoDB');
        }
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        setTimeout(connectToMongo, 5000); // Retry connection after 5 seconds
    }
}

// Initialize connection
connectToMongo();

// Helper function to get database
const getDatabase = async () => {
    if (!db) {
        await connectToMongo();
    }
    return db;
};

// Endpoint to send the order
app.post("/sendOrder", async (req, res) => {
    try {
        const db = await getDatabase();
        const tableNumber = String(req.query.table_num || req.body.tableNumber).trim();
        const { dishes, tokenId } = req.body;

        if (!tableNumber || isNaN(tableNumber)) {
            return res.status(400).json({ error: "A valid table number is required" });
        }

        const newOrder = {
            tableNumber,
            dishes,
            createdAt: new Date(),
            isDelivered: false,
            tokenId,
        };

        const result = await db.collection('orders').insertOne(newOrder);
        res.status(200).json({ message: "Order received successfully", tokenId, orderId: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: "Error: " + error.message });
    }
});

// Endpoint to mark an order as delivered
app.post("/markAsDelivered", async (req, res) => {
    try {
        const db = await getDatabase();
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ error: "Order ID is required" });
        }

        const result = await db.collection('orders').updateOne(
            { _id: new ObjectId(orderId) },
            { $set: { isDelivered: true } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.status(200).json({ message: "Order marked as delivered successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error: " + error.message });
    }
});

// Endpoint to reserve a table
app.post("/reserveTable", async (req, res) => {
    try {
        const db = await getDatabase();
        const { name, phone, date, time, persons } = req.body;

        const reservation = {
            name,
            phone,
            date,
            time,
            persons,
            createdAt: new Date(),
        };

        const result = await db.collection('reservations').insertOne(reservation);
        res.status(200).json({ message: "Reservation saved successfully", id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: "Error: " + error.message });
    }
});

// Get orders from the database
app.get("/getOrders", async (req, res) => {
    try {
        const db = await getDatabase();
        const orders = await db.collection('orders').find({}).toArray();
        res.status(200).json({ orders });
    } catch (error) {
        res.status(500).json({ error: "Error: " + error.message });
    }
});

// Get reservations from the database
app.get("/getReservations", async (req, res) => {
    try {
        const db = await getDatabase();
        const reservations = await db.collection('reservations').find({}).toArray();
        res.status(200).json({ reservations });
    } catch (error) {
        res.status(500).json({ error: "Error: " + error.message });
    }
});

// Server-Sent Events route for orders
app.get('/streamOrders', async (req, res) => {
    try {
        const db = await getDatabase();
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const sendEvent = (change) => {
            res.write(`data: ${JSON.stringify(change)}\n\n`);
        };

        const ordersChangeStream = db.collection('orders').watch();
        ordersChangeStream.on('change', sendEvent);

        req.on('close', () => {
            ordersChangeStream.removeAllListeners('change');
        });
    } catch (error) {
        res.status(500).json({ error: "Error: " + error.message });
    }
});

// Server-Sent Events route for reservations
app.get('/streamReservations', async (req, res) => {
    try {
        const db = await getDatabase();
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const sendEvent = (change) => {
            res.write(`data: ${JSON.stringify(change)}\n\n`);
        };

        const reservationsChangeStream = db.collection('reservations').watch();
        reservationsChangeStream.on('change', sendEvent);

        req.on('close', () => {
            reservationsChangeStream.removeAllListeners('change');
        });
    } catch (error) {
        res.status(500).json({ error: "Error: " + error.message });
    }
});

// Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });

module.exports = app;
