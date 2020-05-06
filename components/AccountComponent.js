import React, { useState, useEffect } from 'react'
import { useRouter, withRouter } from 'next/router'
import Head from 'next/head'
import { Button, Error, Loading, Notification, Spinner, Collapsable } from '@tryyack/elements'
import { openAppModal } from '@tryyack/dev-kit'
import fetch from 'isomorphic-unfetch'

function AccountComponent(props) {
  const { router: { query }} = props
  const { userId, token } = query
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const getAccount = async () => {
    const channeltoken = token || '5e92a53e8314d31bbc73b0cd'

    // Fetch all of the accounts linked to this channel
    // using the Channel / App token
    fetch('/api/accounts',{ headers: { channeltoken } })
    .then(res => res.json())
    .then(json => {
      if (json.error) return setError('Error fetching accounts')

      // Otherwise add our account to the list
      setAccount(json.accounts)
    })
    .catch(error => {
      setError('Error in API response')
    })
  }

  useEffect(() => {
    //getAccounts()
  }, [])

  return (
    <React.Fragment>
      <style scoped jsx>{`
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


      <Collapsable title={props.account.authEmail}>
        Okay
      </Collapsable>


    </React.Fragment>
  )
}

AccountComponent.getInitialProps = async ({ query }) => {

}

export default withRouter(AccountComponent)
