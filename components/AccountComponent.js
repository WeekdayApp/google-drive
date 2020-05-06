import React, { useState, useEffect } from 'react'
import { useRouter, withRouter } from 'next/router'
import Head from 'next/head'
import { Button, Error, Loading, Notification, Spinner, Collapsable } from '@tryyack/elements'
import { openAppModal } from '@tryyack/dev-kit'
import fetch from 'isomorphic-unfetch'
import { ChevronDown, Trash, ChevronUp, ChevronLeft, ChevronRight } from 'react-feather'

function AccountComponent(props) {
  const { router: { query }} = props
  const { userId, token } = query
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [page, setPage] = useState(0)
  const [files, setFiles] = useState([])
  const [pageToken, setPageToken] = useState(null)
  const [pageSize, setPageSize] = useState(10)

  const getFiles = async page => {
    const { _id, authToken, channelToken, userId, authEmail } = props.account

    setLoading(true)

    fetch('/api/files', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authToken, channelToken, userId, authEmail, pageToken, pageSize }),
    })
    .then(res => res.json())
    .then(json => {
      const { files, nextPageToken } = json

      // Update the files listed
      setFiles(files)
      setPageToken(nextPageToken)
      setLoading(false)
    })
    .catch(error => {
      setError('Error in API response')
      setLoading(false)
    })
  }

  const removeAccount = async () => {
    const { _id, authToken, channelToken, userId, authEmail } = props.account
    const result = confirm('Are you sure? This cannot be undone.')

    if (result) {
      fetch('/api/accounts', {
        method: 'delete',
        headers: {
          authtoken: authToken,
          accountid: _id,
        }
      })
      .then(res => {
        props.getAccounts()
      })
      .catch(error => {
        setError('Error in API response')
      })
    }
  }

  useEffect(() => {
    getFiles(0)
    setPage(0)
  }, [])

  return (
    <React.Fragment>
      <style scoped jsx>{`

      `}</style>

      <div className="row w-100 p-10 border-bottom">
        <div className="h6 bold color-d3">{props.account.authEmail}</div>
        <div className="flexer" />
        <ChevronDown
          color="#343a40"
          size="14"
          thickness="2"
          className="button"
          onClick={removeAccount}
        />
      </div>

      {files.map((file, index) => {
        return (
          <div className="column w-100 p-10 pt-5 pb-5" key={index}>
            <div className="p regular color-d2">{file.name}</div>
            <div className="row mt-5 w-100">
              <img src={file.iconLink} height="10" className="mr-5"/>
              <div className="small regular color-d0 mr-10">Modified {file.modifiedTime}</div>
              <div className="flexer" />
              <div className="small x-bold color-blue mr-10">Open</div>
              <div className="small x-bold color-blue mr-10">Post to channel</div>
            </div>
          </div>
        )
      })}

      <div className="row w-100 p-10">
        <div className="row button" onClick={removeAccount}>
          <Trash
            color="#343a40"
            size="14"
            thickness="1.5"
            className="mr-10"
          />
          <div className="small x-bold color-d2">REMOVE ACCOUNT</div>
        </div>
        <div className="flexer" />
        <ChevronLeft
          color="#343a40"
          size="14"
          thickness="2"
          className="button"
          onClick={removeAccount}
        />
        <ChevronRight
          color="#343a40"
          size="14"
          thickness="2"
          className="button ml-10"
          onClick={removeAccount}
        />
      </div>

    </React.Fragment>
  )
}

AccountComponent.getInitialProps = async ({ query }) => {

}

export default withRouter(AccountComponent)
