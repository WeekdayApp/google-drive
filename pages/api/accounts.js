import nextConnect from "next-connect";
import middleware from "../../middleware/database";

const handler = nextConnect();

handler
  .use(middleware)
  .post(async (req, res) => {
    const { userId, token } = req.body

    res.json({ userId, token })
  })
  .put(async (req, res) => {
    let docs = await req.db.collection('accounts').find().toArray()

    res.json(docs);
  })

export default handler;
