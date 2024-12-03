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
    return
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
      return undefined
    })
}

export const getTasks = async (searchText: string | undefined) => {
  const token = await getToken()
  if (!token) {
    return
  }
  let isId
  if (searchText) {
    isId =
      searchText.split('-').length == 5 &&
      searchText.charAt(8) == '-' &&
      searchText.charAt(13) == '-' &&
      searchText.charAt(18) == '-' &&
      searchText.charAt(23) == '-'
  }
  return fetch(
    new URL(
      `${baseURI}/me/projecttasks?filterby=taskstatus/type ne 'done'${searchText ? (isId ? ` and id eq guid'${searchText}'` : ` and (substringof('${searchText}',name) or substringof('${searchText}',project/name))`) : ''}`,
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
      return undefined
    })
}

export const getTypesOfWork = async () => {
  const token = await getToken()
  if (!token) {
    return
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
      return undefined
    })
}
