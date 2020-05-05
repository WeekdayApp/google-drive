import nextConnect from "next-connect";
import middleware from "../../../middleware/database";

const handler = nextConnect();

handler
  .use(middleware)
  .get(async (req, res) => {
    try {
      const { query: { token } } = req
      const docs = await req.db.collection('accounts').find({ token }).toArray()

      res.json({ docs })
    } catch (e) {
      res.json({ docs: null })
    }
  })
  .delete(async (req, res) => {
    let doc = await req.db.collection('accounts').findOne()

    res.json(doc ? doc : {});
  })

export default handler;
