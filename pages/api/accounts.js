import nextConnect from "next-connect";
import middleware from "../../middleware/database";

const handler = nextConnect();

handler
  .use(middleware)
  .post(async (req, res) => {
    const { userId, token, scope, code } = req.body
    const { google } = require('googleapis')
    const oAuth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URL
    )

    // Get our oAuth2 token
    oAuth2Client.getToken(code, (err, authToken) => {
      if (err) return console.error('Error retrieving access token', err);

      // Update our client so we can get the files
      oAuth2Client.setCredentials(authToken)

      // Create a generic client
      const oauth2Client = google.oauth2({ auth: oAuth2Client, version: 'v2' });

      // Get the user info
      oauth2Client.userinfo.get((err, result) => {
          if (err) return console.log(err)

          // Just get the email
          const { email } = result.data

          // Create a base64 encoded value from the token
          const base64 = Buffer.from(JSON.stringify(authToken)).toString('base64')

          // Store this in our DB
          req
            .db
            .collection('accounts')
            .insert({
              authToken: base64,
              channelToken: token || 'no channelToken',
              userId: userId || 'no userId',
              authEmail: email || 'no authEmail'
            })
            .then(result => {
              console.log(result)
              res.json({ result })
            })
            .catch(error => {
              console.log(error)
              res.json({ error })
            })
      })
    })
  })
  .put(async (req, res) => {
    let docs = await req.db.collection('accounts').find().toArray()

    res.json(docs);
  })

export default handler;
