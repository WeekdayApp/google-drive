import React, { useState, useEffect } from 'react'
import { useRouter, withRouter } from 'next/router'
import Head from 'next/head'
import { Button, Error, Loading, Notification, Spinner } from '@tryyack/elements'
import fetch from 'isomorphic-unfetch'
import { syncMessageHeight } from '@tryyack/dev-kit'

function File(props) {
  const { router: { query }} = props
  const { userId, token, resourceId, resizeId } = query
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [file, setFile] = useState({ name: 'default' })

  useEffect(() => {
    if (!query.resourceId) return

    const { userId, token, resourceId, resizeId } = query
    const resourceIdDecoded = JSON.parse(window.atob(decodeURI(resourceId)))
    const { accountId, fileId } = resourceIdDecoded

    setError(null)
    setLoading(true)

    fetch('/api/file', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, fileId }),
    })
    .then(res => res.json())
    .then(res => {
        const { file } = res

        setLoading(false)
        setFile(file)
        syncMessageHeight(resizeId)
    })
    .catch(error => {
      setError('There has been an error')
      setLoading(false)
    })
  }, [query])

  return (
    <React.Fragment>
      <Head>
        <title>Google Drive</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
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
          overflow: scroll;
        }

        .container {
          background: white;
          width: 100%;
          height: 100%;
          position: absolute;
          left: 0px;
          top: 0px;
          display: flex;
          overflow: scroll;
        }

        .error {
          position: absolute;
          top: 0px;
          left: 0px;
          width: 100%;
        }
      `}</style>

      <div className="container column">
        {loading && <Spinner />}
        {error && <div className="error"><Error message={error} /></div>}

        <div className="row p-10 w-100 border-bottom">
          {file.name}
        </div>

      </div>
    </React.Fragment>
  )
}

/*
File.getInitialProps = async ({ query }) => {
  try {
    const { userId, token, resourceId, resizeId } = query
    const resourceIdDecoded = JSON.parse(Buffer.from(decodeURI(resourceId), 'base64').toString())
    const { accountId, fileId } = resourceIdDecoded

    const result = await fetch('/api/test', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, fileId }),
    })
    console.log(result)
    const { file } = await result.json()

    return { file }
  } catch (error) {
    return { error }
  }
}
*/

export default withRouter(File)
