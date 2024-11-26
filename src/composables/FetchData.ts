import { showToast, Toast } from '@raycast/api'
import fetch from 'node-fetch'
import { getToken } from './WebClient'

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

const baseURL = 'https://api.awork.com/api/v1'

export const getProjects = async (searchText: string | undefined) => {
  const token = await getToken()
  if (!token) {
    return
  }
  return fetch(`${baseURL}/projects${searchText ? `?filterby=substringof('${searchText}',name)` : ''}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    },
    redirect: 'follow'
  })
    .then((response) => response.text())
    .then((result) => <Array<project>>JSON.parse(result))
    .catch((e: Error) => {
      showToast({
        style: Toast.Style.Failure,
        title: e.name === 'FetchError' ? 'Couldn´t load Projects' : e.name,
        message: e.name === 'FetchError' ? e.name + ': ' + e.message : e.message
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
  return fetch(`${baseURL}/me/projecttasks?filterby=taskstatus/type%20ne%20'done'${searchText ? `%20and%20(substringof('${searchText}',name)%20or%20substringof('${searchText}',project/name))` : ''}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    },
    redirect: 'follow'
  })
    .then((response) => response.text())
    .then((result) => <Array<task>>JSON.parse(result))
    .catch((e: Error) => {
      showToast({
        style: Toast.Style.Failure,
        title: e.name === 'FetchError' ? 'Couldn´t load Tasks' : e.name,
        message: e.name === 'FetchError' ? e.name + ': ' + e.message : e.message
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
  return fetch(`${baseURL}/typeofwork?OrderBy=name`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    },
    redirect: 'follow'
  })
    .then((response) => response.text())
    .then((result) => <Array<typeOfWork>>JSON.parse(result))
    .catch((e: Error) => {
      showToast({
        style: Toast.Style.Failure,
        title: e.name === 'FetchError' ? 'Couldn´t load Types of work' : e.name,
        message: e.name === 'FetchError' ? e.name + ': ' + e.message : e.message
      })
      console.error(e)
      return undefined
    })
}
