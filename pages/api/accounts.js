import nextConnect from "next-connect";
import middleware from "../../middleware/database";
import { ObjectID } from "mongodb";
import fetch from 'isomorphic-unfetch'

const handler = nextConnect();

handler
  .use(middleware)
  .delete(async (req, res) => {
    try {
      const { headers: { authtoken, accountid } } = req
      const authToken = JSON.parse(Buffer.from(authtoken, 'base64').toString())
      const { google } = require('googleapis')
      const oAuth2Client = new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.REDIRECT_URL
      )

      // Set up our credentials
      oAuth2Client.setCredentials(authToken)

      // Revoke this token mnually because Google's API was breaking
      const result = await fetch('https://oauth2.googleapis.com/revoke', {
        method: 'post',
        headers: { 'Content-type': 'application/x-www-form-urlencoded' },
        body: 'token=' + authToken.access_token
      })

      // Remove the DB document
      await req.db.collection('accounts').remove({ _id: new ObjectID(accountid) })

      // And all good
      res.json({ success: true })
    } catch (error) {
      res.json({ error })
    }
  })
  .get(async (req, res) => {
    try {
      const { headers: { channeltoken } } = req
      const channelToken = channeltoken
      const accounts = await req.db.collection('accounts').find({ channelToken }).toArray()

      res.json({ accounts })
    } catch (error) {
      res.json({ error })
    }
  })
  .post(async (req, res1) => {
    const { userId, channelToken, scope, code } = req.body
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
      oauth2Client.userinfo.get((err, res2) => {
          if (err) return console.log(err)

          // Just get the email
          const { email } = res2.data

          // Create a base64 encoded value from the token
          const base64 = Buffer.from(JSON.stringify(authToken)).toString('base64')
          const account = {
            authToken: base64,
            authEmail: email || 'no authEmail',
            channelToken: channelToken || 'no channelToken',
            userId: userId || 'no userId',
          }

          // Store this in our DB
          // And then send back the new account to the caller
          // res1 is our API res
          req
            .db
            .collection('accounts')
            .insertOne(account)
            .then(res3 => {
              res1.json({ account })
            })
            .catch(error => {
              res1.json({ error })
            })
      })
    })
  })

export default handler;
