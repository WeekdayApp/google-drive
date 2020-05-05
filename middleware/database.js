import { MongoClient } from "mongodb";
import nextConnect from "next-connect";

const client = new MongoClient(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function database(req, res, next) {
  try {
    if (!client.isConnected()) await client.connect();

    req.dbClient = client;
    req.db = client.db("apps");
    req.db.createCollection("accounts", { "capped": false, "size": 100000, "max": 5000 }, (err, results) => {
      console.log("Collection created.");
    });

    console.log('DB Connected')

    return next();
  } catch (e) {
    console.log(e)
  }
}

const middleware = nextConnect();

middleware.use(database);

export default middleware;
