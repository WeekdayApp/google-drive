import nextConnect from "next-connect";
import middleware from "../../middleware/database";

const handler = nextConnect();

handler
  .use(middleware)
  .post(async (req, res) => {
    const { userId, token, code } = req.body


    const { google } = require('googleapis')
    const fs = require('fs')
    const readline = require('readline')
    const oAuth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URL
    )


    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);

      oAuth2Client.setCredentials(token);

      STORE IN DB -> JSON.stringify(token)


    });





    res.json({ userId, token })
  })
  .put(async (req, res) => {
    let docs = await req.db.collection('accounts').find().toArray()

    res.json(docs);
  })

export default handler;
