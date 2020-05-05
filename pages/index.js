import React, { useState, useEffect } from 'react'
import { useRouter, withRouter } from 'next/router'
import Head from 'next/head'
import { Button, Error, Loading, Notification, Spinner } from '@tryyack/elements'
import { openAppModal } from '@tryyack/dev-kit'
import fetch from 'isomorphic-unfetch'

function Index(props) {
  const { router: { query }} = props
  const { userId, token } = query
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  let popup

  useEffect(() => {
    window.addEventListener('message', event => {
      const { oauthComplete, scope, code } = event.data

      if (oauthComplete && popup) {
        console.log({ scope, code })
        popup.close()
        popup = null
      }
    }, false)
  })

  return (
    <React.Fragment>
      <Head>
        <title>Google Drive</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link href="https://yack-apps.s3.eu-central-1.amazonaws.com/styles.css" rel="stylesheet" />
        <link href="https://yack-apps.s3.eu-central-1.amazonaws.com/favicon.png" rel="shortcut icon" />
      </Head>

      <style global jsx>{`
        * {
          margin: 0px;
          padding: 0px;
        }

        body {
          background: white;
        }

        .container {
          background: white;
          width: 100%;
          height: 100%;
          position: absolute;
          left: 0px;
          top: 0px;
          display: flex;
          align-items: stretch;
          align-content: center;
          justify-content: center;
        }

        .error {
          position: absolute;
          top: 0px;
          left: 0px;
          width: 100%;
        }
      `}</style>

      <div className="container column">
        <div className="listing-container">
          {loading && <Spinner />}
          {error && <div className="error"><Error message="Error loading polls" /></div>}

          {!data &&
            <React.Fragment>
              <div className="mb-20 pl-20 pr-20 text-center"><img src="https://yack-apps.s3.eu-central-1.amazonaws.com/icons/google-drive.svg" width="60%" className="mb-30"/></div>
              <div className="h3 mb-20 pl-20 pr-20 color-d2 text-center">There are no connected accounts</div>
              <div className="h5 mb-20 pl-20 pr-20 color-d0 text-center">Click on the button below to connect an account.</div>
            </React.Fragment>
          }

          <div className="row justify-content-center mt-30 w-100">
            <Button
              size="small"
              theme="blue-border"
              text="Connect Google Drive"
              onClick={() => {
                popup = window.open(props.authUrl, 'Complete OAuth2', 'location=no,toolbar=no,menubar=no,width=600,height=500,left=200,top=100')
              }}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

Index.getInitialProps = async ({ query }) => {
  try {
    const { userId, token } = query
    const channelToken = token
    const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly']
    const { google } = require('googleapis')
    const fs = require('fs')
    const readline = require('readline')
    const oAuth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URL
    )
    const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES })

    /*
    const listFiles = (auth, token) => {
      auth.setCredentials(token)
      const drive = google.drive({ version: 'v3', auth })
      drive.files.list(
        {
          pageSize: 10,
          fields: 'nextPageToken, files(id, name)',
        },
        (err, res) => {
          if (err) return console.log('The API returned an error: ' + err)
          const files = res.data.files
          if (files.length) {
            console.log('Files:')
            files.map(file => {
              console.log(`${file.name} (${file.id})`)
            })
          } else {
            console.log('No files found.')
          }
        }
      )
    }

    listFiles(oAuth2Client, TOKEN_FROM_MONGODB)


    const res = await fetch(`${process.env.HOST}/api/accounts`,  {
    	method: 'post',
    	headers: { 'Content-Type': 'application/json' },
    	body: JSON.stringify({ userId: 1, token: 2 }),
    })

    const res = await fetch(`${process.env.HOST}/api/accounts/joduplessis`)
    const json = await res.json()

    */

    return {
      authUrl
    }
  } catch (e) {
    return {
      authUrl: null
    }
  }
}

export default withRouter(Index)
