import {Action, ActionPanel, Form, LaunchProps, LocalStorage, useNavigation} from "@raycast/api"
import {FormValidation, useForm, usePromise} from "@raycast/utils"
import fetch from "node-fetch"
import {getProjects, getTasks, getTypesOfWork, task} from "./composables/fetchData";
import {getToken} from "./composables/WebClient"

interface FormValues {
  note: string
  projectId: string
  taskId: string
  typeOfWorkId: string
  date: Date | null
  startTime: string
  duration: string
  isBillable: boolean
}

const baseURL = 'https://api.awork.com/api/v1'

const bookTime = async (values: FormValues, tasks: task[] | undefined) => {
  values.date = values.date ? values.date : new Date()
  const task = tasks!.filter((value) => value.id === values.taskId)[0]
  const body = JSON.stringify({
    "note": values.note,
    "timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
    "typeOfWorkId": values.typeOfWorkId,
    "userId": (await LocalStorage.getItem<string>('userId'))?.valueOf(),
    "projectId": values.projectId !== 'none' ? values.projectId : task.projectId,
    "taskId": values.taskId !== 'none' ? values.taskId : undefined,
    "StartDateLocal": `${values.date?.getFullYear()}-${values.date?.getMonth() + 1}-${values.date?.getDate()}`,
    "StartTimeLocal": values.startTime ? values.startTime.includes('now') ? new Date().toLocaleTimeString('de-DE') : values.startTime : undefined,
    "Duration": values.duration,
    "isBillable": values.isBillable
  })
  console.log(body)
  await fetch(`${baseURL}/timeentries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getToken()}`,
    },
    body: body,
    redirect: 'follow',
  }).catch((e) => console.log(e))
}

export default function Command(props: LaunchProps) {
  const {pop} = useNavigation()
  const {handleSubmit, itemProps, setValidationError, setValue, values} = useForm<FormValues>({
    onSubmit: async (values) => {
      await bookTime(values, tasks)
      pop()
    },
    initialValues: props.draftValues || {date: new Date(), isBillable: true},
    validation: {
      projectId: (value) => {
        if ((!value || value === 'none') && values.taskId === 'none') {
          return 'Please select a project'
        }
      },
      typeOfWorkId: FormValidation.Required,
      date: FormValidation.Required,
      startTime: (value) => {
        if (value) {
          if (value.match(/^ *(([0-1][0-9])|(2[0-3])):[0-5]\d *$/)) {
            return
          } else if (value.match(/^ *now *$/i)) {
            return
          }
          return 'Please use format hh:mm'
        }
      }
    }
  })
  const {data: typesOfWork, isLoading: isLoadingTypesOwWork} = usePromise(getTypesOfWork)
  const {data: projects, isLoading: isLoadingProjects} = usePromise(getProjects)
  const {data: tasks, isLoading: isLoadingTasks} = usePromise(getTasks)

  return (
    <Form enableDrafts={true} isLoading={isLoadingTypesOwWork || isLoadingProjects || isLoadingTasks} actions={
      <ActionPanel>
        <Action.SubmitForm onSubmit={handleSubmit}></Action.SubmitForm>
      </ActionPanel>}
    >
      <Form.TextField title={'Note'} {...itemProps.note} />
      <Form.Dropdown title={'Project'} {...itemProps.projectId} onChange={(projectId) => {
        if (projectId) {
          setValue('projectId', projectId)
          const project = projects?.filter((value) => value.id === projectId)[0]
          if (project?.isBillableByDefault) {
            setValue('isBillable', project.isBillableByDefault)
          }
        }
      }}>
        <Form.Dropdown.Item key={'none'} title={'No Project'} value={'none'}/>
        {projects && projects.map((project) => <Form.Dropdown.Item key={project.id} title={project.name}
                                                                   value={project.id}/>)}
      </Form.Dropdown>
      <Form.Dropdown title={'Task'} {...itemProps.taskId} onChange={(taskId) => {
        if (taskId) {
          setValue('taskId', taskId)
          const task = tasks?.filter((value) => taskId === value.id)[0]
          setValue('projectId', task?.projectId || '')
          setValidationError('projectId', undefined)
          if (task?.typeOfWorkId) {
            setValue('typeOfWorkId', task.typeOfWorkId)
          }
        }
      }}>
        <Form.Dropdown.Item key={'none'} title={'No Task'} value={'none'}/>
        {tasks && tasks.filter((task) => !itemProps.projectId || itemProps.projectId.value === 'none' || task.projectId.includes(itemProps.projectId.value || '')).map((task) =>
          <Form.Dropdown.Item key={task.id} title={task.name} value={task.id}/>)}
      </Form.Dropdown>
      <Form.Dropdown title={'Type of work'} {...itemProps.typeOfWorkId}>
        {typesOfWork && typesOfWork.map((typeOfWork) => <Form.Dropdown.Item key={typeOfWork.id} title={typeOfWork.name}
                                                                            value={typeOfWork.id}/>)}
      </Form.Dropdown>
      <Form.DatePicker type={Form.DatePicker.Type.Date} {...itemProps.date} />
      <Form.TextField title={'Start time'} {...itemProps.startTime} info={'Format hh:mm'}/>
      <Form.TextField title={'Duration'} {...itemProps.duration} onChange={(duration) => {
        setValue('duration', duration)
      }}/>
      <Form.Checkbox {...itemProps.isBillable} label={'Billable'}/>
    </Form>
  )
}
