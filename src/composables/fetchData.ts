import fetch from "node-fetch";
import {getToken} from "./WebClient";

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
  typeOfWorkId?: string
}

export interface typeOfWork {
  id: string
  name: string
}

const baseURL = 'https://api.awork.com/api/v1'

export const getProjects = async () => {
  return fetch(`${baseURL}/projects`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${await getToken()}`,
    },
    redirect: 'follow',
  }).then((response) => response.text())
    .then((result) => JSON.parse(result) as project[])
    .catch((e) => {
      console.error(e)
      return undefined
    })
}

export const getTasks = async () => {
  return fetch(`${baseURL}/me/projecttasks?filterby=taskstatus/type ne 'done'`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${await getToken()}`,
    },
    redirect: 'follow',
  }).then((response) => response.text())
    .then((result) => JSON.parse(result) as task[])
    .catch((e) => {
      console.error(e)
      return undefined
    })
}

export const getTypesOfWork = async () => {
  return fetch(`${baseURL}/typeofwork?OrderBy=name`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${await getToken()}`,
    },
    redirect: 'follow',
  }).then((response) => response.text())
    .then((result) => JSON.parse(result) as typeOfWork[])
    .catch((e) => {
      console.error(e)
      return undefined
    })
}
