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
  company: company
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

export const getProjects = async () => {
  const token = await getToken()
  if (!token) {
    return
  }
  return fetch(`${baseURL}/projects`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    },
    redirect: 'follow'
  })
    .then((response) => response.text())
    .then((result) => JSON.parse(result) as project[])
    .catch((e: Error) => {
      showToast({ style: Toast.Style.Failure, title: e.name, message: e.message })
      console.log(e)
      return undefined
    })
}

export const getTasks = async () => {
  const token = await getToken()
  if (!token) {
    return
  }
  return fetch(
    `${baseURL}/me/projecttasks?filterby=taskstatus/type%20ne%20'done'`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      },
      redirect: 'follow'
    }
  )
    .then((response) => response.text())
    .then((result) => JSON.parse(result) as task[])
    .catch((e: Error) => {
      showToast({ style: Toast.Style.Failure, title: e.name, message: e.message })
      console.log(e)
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
    .then((result) => JSON.parse(result) as typeOfWork[])
    .catch((e: Error) => {
      showToast({ style: Toast.Style.Failure, title: e.name, message: e.message })
      console.log(e)
      return undefined
    })
}
