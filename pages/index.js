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
  const [accounts, setAccount] = useState(null)
  let popup

  const getAccounts = async () => {
    const channelToken = token || '5e92a53e8314d31bbc73b0cd'

    // Fetch all of the accounts linked to this channel
    // using the Channel / App token
    fetch('/api/accounts',{ headers: { channelToken } })
    .then(res => res.json())
    .then(json => {
      const { accounts, error } = json

      // If there's been an error
      if (error) return setError('Error fetching accounts')

      // Otherwise add our account to the list
      setAccount([account, ...accounts])
    })
    .catch(error => {
      setError('Error in API response')
    })
  }

  useEffect(() => {
    getAccounts()

    // If the auth window posts back a code we can handle it here
    window.addEventListener('message', event => {
      const { scope, code } = event.data

      // If everything has been returned correctly
      if (scope && code && popup) {
        // Kill/Close the popup first
        popup.close()
        popup = null

        // Create the token
        fetch('/api/accounts', {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, token, scope, code }),
        })
        .then(res => res.json())
        .then(json => {
          const { account, error } = json

          // If there's been an error
          if (error) return setError('Error adding account')

          // Otherwise add our account to the list
          setAccount([account, ...accounts])
        })
        .catch(error => {
          setError('Error in API response')
        })
      } else {
        setError('Incorrect response from popup')
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
        <link href="/static/css/styles.css" rel="stylesheet" />
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
    const SCOPES = [
      // 'https://www.googleapis.com/auth/drive.readonly',
      //'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.metadata.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
    ]
    const { google } = require('googleapis')
    const fs = require('fs')
    const readline = require('readline')
    const oAuth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URL
    )

    // Auto generate a token so that we can immediately direct the user
    const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES })

    /*
    const authToken = JSON.parse(Buffer.from('eyJhY2Nlc3NfdG9rZW4iOiJ5YTI5LmEwQWU0bHZDMW9iT1JpNFV5ZjJkdHJiaXhzdzVkZldnWnpqNTkybUQzTGpyX0VnNGpOSkl0a1Y1WDBaTnZ0Q0wza3ZwVTJZNWRKQ1hMem9Zc1dpUDZyZXlkUlRLd1lpX0dRUEJZX3BRcWZoMlJvanRoQnhLeTNpQ0t0azVRNlNVaWMxcHE5WlNjOWo5QzRwNW85Y2c3X19fMFUtT3BNU2pIS08zMCIsInJlZnJlc2hfdG9rZW4iOiIxLy8wM0t5cURVTHFJOFl5Q2dZSUFSQUFHQU1TTndGLUw5SXJ6bmo4WjNCRFRiY1BQcUk0NWJSYlhjbktnZHVNZ1k0NDNZdGZHWVMxWGJtNXdQU0x3MUpseVJJcXdpb3FGLWhLaGpzIiwic2NvcGUiOiJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL2RyaXZlLnJlYWRvbmx5IGh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvZHJpdmUuZmlsZSBodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL2RyaXZlLm1ldGFkYXRhLnJlYWRvbmx5IG9wZW5pZCBodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL3VzZXJpbmZvLmVtYWlsIiwidG9rZW5fdHlwZSI6IkJlYXJlciIsImlkX3Rva2VuIjoiZXlKaGJHY2lPaUpTVXpJMU5pSXNJbXRwWkNJNklqYzBZbVE0Tm1aak5qRmxOR00yWTJJME5UQXhNalptWmpSbE16aGlNRFk1WWpobU9HWXpOV01pTENKMGVYQWlPaUpLVjFRaWZRLmV5SnBjM01pT2lKb2RIUndjem92TDJGalkyOTFiblJ6TG1kdmIyZHNaUzVqYjIwaUxDSmhlbkFpT2lJeE56QXpNekU0T0RBNE5qQXRNWEJ6Y0hGdmJteGlhRGx5YUdjMGRUQjBjSEZ2TUd0alkyNXVhV3BwTVdvdVlYQndjeTVuYjI5bmJHVjFjMlZ5WTI5dWRHVnVkQzVqYjIwaUxDSmhkV1FpT2lJeE56QXpNekU0T0RBNE5qQXRNWEJ6Y0hGdmJteGlhRGx5YUdjMGRUQjBjSEZ2TUd0alkyNXVhV3BwTVdvdVlYQndjeTVuYjI5bmJHVjFjMlZ5WTI5dWRHVnVkQzVqYjIwaUxDSnpkV0lpT2lJeE1EZzBOamczTVRRd05UVTVPVEEyTkRVNE5qVWlMQ0psYldGcGJDSTZJbXB2YUdGdWJtVnpMbVIxY0d4bGMzTnBjMEJuYldGcGJDNWpiMjBpTENKbGJXRnBiRjkyWlhKcFptbGxaQ0k2ZEhKMVpTd2lZWFJmYUdGemFDSTZJa3g2TFdZeFFqZEJia2hIU21aV05rOW9NREJ0WDBFaUxDSnBZWFFpT2pFMU9EZzJOemN5TkRrc0ltVjRjQ0k2TVRVNE9EWTRNRGcwT1gwLlZkRldKeGkxN3hNTUE4WW9XcHJIQXVZVWhKODVPekNVRnZPaVQ2c0xnMXVnVDZqM3o1empTRlhWTktsQ1JEWW1tcjVvWDdlRFRHWGJtQnU0dUpLZU9LTGdTVFl3SExfSklzd1BYSkM4aUVoc1pLWW5OM0RpbV9WbnkyZGdvR0ItSVJ4VkwwcHdVSlQtc05iTm5rS0NoX2FzY3k2NzlqbkloVHYxelZ0MHZaRFVqVlpKcllObkVOVmNITUxMRnAwaFFEUmF6b2FlYkt4LWI1b3VPM25LaVg1b1pZdEtUTWVpOWM1TzdBa0EyUG1TZGVYVkRBYXdPN2pSX0pGMUhHZk95cUlwUnA0Um92RU9waFEzVnBYSkxNdFVrbU9neHp0YTF0d2FVZU91UHR2SHZuT0NTOFAwZC05ZFpBSDhvaWdOYkVIT2E4WGZnc0NNM2VWZVdPbGl1USIsImV4cGlyeV9kYXRlIjoxNTg4NjgwODQ4NzIzfQ==', 'base64').toString())

    // Set up our credentials
    oAuth2Client.setCredentials(authToken)

    // Init the drive API using our client
    const drive = google.drive({ version: 'v3', auth: oAuth2Client })

    // List of available fields
    // https://developers.google.com/drive/api/v3/reference/files#resource
    drive.files.list({
      pageSize: 10,
      pageToken: null,
      fields: 'nextPageToken, files(id, kind, name, mimeType, webViewLink, webContentLink, iconLink, hasThumbnail, thumbnailLink, thumbnailVersion, modifiedTime, createdTime)',
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err)

      // List of files / next page
      const { files, nextPageToken } = res.data
    })
    */

    return {
      authUrl,
    }
  } catch (e) {
    return {
      authUrl: null
    }
  }
}

export default withRouter(Index)
