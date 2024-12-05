import { showToast, Toast } from '@raycast/api'
import fetch from 'node-fetch'
import { baseURI, getToken } from './WebClient'

interface company {
  id: string
  name: string
}

export interface project {
  id: string
  name: string
  isBillableByDefault: boolean
  company?: company
}

export interface task {
  id: string
  name: string
  projectId: string
  project: project
  typeOfWorkId?: string
}

export interface typeOfWork {
  id: string
  name: string
}

const getRequestOptions = (token: string) => ({
  method: 'GET',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  redirect: <RequestRedirect>'follow',
})

export const getProjects = async (searchText: string | undefined) => {
  const token = await getToken()
  if (!token) {
    return 'noToken'
  }
  return fetch(
    new URL(
      `${baseURI}/projects${searchText ? `?filterby=substringof('${searchText}',name)` : ''}`,
    ),
    getRequestOptions(token),
  )
    .then((response) => response.text())
    .then((result) => <Array<project>>JSON.parse(result))
    .catch((e: Error) => {
      showToast({
        style: Toast.Style.Failure,
        title: e.name === 'FetchError' ? 'Couldn´t load Projects' : e.name,
        message:
          e.name === 'FetchError' ? e.name + ': ' + e.message : e.message,
      })
      console.error(e)
      return 'error'
    })
}

export const getTasks = async (searchText: string | undefined) => {
  const token = await getToken()
  if (!token) {
    return 'noToken'
  }
  let filter = ''
  if (searchText) {
    if (
      searchText.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      )
    ) {
      filter = ` and id eq guid'${searchText}'`
    } else {
      filter = ` and (substringof('${searchText}',name) or substringof('${searchText}',project/name))`
    }
  }
  return fetch(
    new URL(
      `${baseURI}/me/projecttasks?filterby=taskstatus/type ne 'done'${filter}`,
    ),
    getRequestOptions(token),
  )
    .then((response) => response.text())
    .then((result) => <Array<task>>JSON.parse(result))
    .catch((e: Error) => {
      showToast({
        style: Toast.Style.Failure,
        title: e.name === 'FetchError' ? 'Couldn´t load Tasks' : e.name,
        message:
          e.name === 'FetchError' ? e.name + ': ' + e.message : e.message,
      })
      console.error(e)
      return 'error'
    })
}

export const getTypesOfWork = async () => {
  const token = await getToken()
  if (!token) {
    return 'noToken'
  }
  return fetch(`${baseURI}/typeofwork?OrderBy=name`, getRequestOptions(token))
    .then((response) => response.text())
    .then((result) => <Array<typeOfWork>>JSON.parse(result))
    .catch((e: Error) => {
      showToast({
        style: Toast.Style.Failure,
        title: e.name === 'FetchError' ? 'Couldn´t load Types of work' : e.name,
        message:
          e.name === 'FetchError' ? e.name + ': ' + e.message : e.message,
      })
      console.error(e)
      return 'error'
    })
}
