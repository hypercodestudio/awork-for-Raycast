import { getPreferenceValues, LocalStorage, OAuth, PreferenceValues } from '@raycast/api'
import fetch, { RequestInit } from 'node-fetch'

interface workspace {
  id: string
  name: string
  url: string
}

interface User {
  id: string
  workspace: workspace
}

const authorizationURI = 'https://api.awork.com/api/v1/accounts/authorize'
const tokensURI = 'https://api.awork.com/api/v1/accounts/token'
export let authorizationInProgress = false
const encodeBase64 = (str: string) =>
  Buffer.from(str, 'binary').toString('base64')

const preferences = getPreferenceValues<PreferenceValues>()

export const client = new OAuth.PKCEClient({
  providerName: 'Awork',
  redirectMethod: OAuth.RedirectMethod.Web,
  description: 'Connect your Awork account...'
})

export const authorizeClient = async () => {
  if (await client.getTokens()) {
    console.log('Already logged in!')
    return
  }

  if (authorizationInProgress) {
    console.log('Already trying to login!')
    return
  }
  authorizationInProgress = true

  const authRequest = await client.authorizationRequest({
    endpoint: authorizationURI,
    clientId: preferences.clientId,
    scope: 'offline_access',
    extraParameters: { clientSecret: preferences.clientSecret }
  })
  const { authorizationCode } = await client.authorize(authRequest)
  const urlencoded = new URLSearchParams()
  urlencoded.append(
    'redirect_uri',
    'https://raycast.com/redirect?packageName=Extension'
  )
  urlencoded.append('grant_type', 'authorization_code')
  urlencoded.append('code', authorizationCode)

  const requestOptions: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${encodeBase64(preferences.clientId + ':' + preferences.clientSecret)}`
    },
    body: urlencoded,
    redirect: 'follow'
  }
  await fetch(tokensURI, requestOptions)
    .then((response) => response.text())
    .then((result) => {
      client.setTokens(<OAuth.TokenResponse>JSON.parse(result))
    })
    .catch((error: Error) => console.error(error))
  if (await client.getTokens()) {
    console.log('Logged in successfully!')
    await getUserData()
  }
  authorizationInProgress = false
}

export const refreshToken = async () => {
  const tokens = await client.getTokens()
  if (!tokens) {
    return await authorizeClient()
  } else {
    if (authorizationInProgress) {
      return
    }
    authorizationInProgress = true
    if (!tokens.refreshToken) {
      return
    }

    const urlencoded = new URLSearchParams()
    urlencoded.append('grant_type', 'refresh_token')
    urlencoded.append('refresh_token', tokens.refreshToken)

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${encodeBase64(preferences.clientId + ':' + preferences.clientSecret)}`
      },
      body: urlencoded,
      redirect: 'follow'
    }

    await fetch(tokensURI, requestOptions)
      .then((response) => response.text())
      .then(async (result) => {
        const newTokens = <OAuth.TokenResponse>JSON.parse(result)
        await client.setTokens(newTokens)
      })
      .catch((error: Error) => console.error(error))

    if (tokens.accessToken !== (await client.getTokens())?.accessToken) {
      console.log('Refreshed Token')
      await getUserData()
    }

    authorizationInProgress = false
  }
}

const getUserData = async () => {
  if (!(await client.getTokens())) await authorizeClient()
  if ((await client.getTokens())?.isExpired()) await refreshToken()

  let data: User

  await fetch('https://api.awork.com/api/v1/users/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${(await client.getTokens())?.accessToken}`
    },
    redirect: 'follow'
  })
    .then((response) => response.text())
    .then(async (result) => {
      data = <User>JSON.parse(result)
      await LocalStorage.setItem('userId', data.id)
      await LocalStorage.setItem('URL', data.workspace.url)
    })
    .catch((error: Error) => console.error(error))
}

export const getToken = async () => {
  if (authorizationInProgress) {
    return
  }
  if (!(await client.getTokens())) {
    await authorizeClient()
  }
  if ((await client.getTokens())?.isExpired()) {
    await refreshToken()
  }
  return (await client.getTokens())?.accessToken
}
