import {
  Action,
  ActionPanel,
  Form,
  LaunchProps,
  LocalStorage,
  showHUD,
  showToast,
  Toast,
  useNavigation
} from '@raycast/api'
import { FormValidation, useForm, usePromise } from '@raycast/utils'
import fetch from 'node-fetch'
import { getProjects, getTasks, getTypesOfWork, task } from './composables/fetchData'
import { getToken } from './composables/WebClient'

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
    note: values.note,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    typeOfWorkId: values.typeOfWorkId,
    userId: (await LocalStorage.getItem<string>('userId'))?.valueOf(),
    projectId: values.projectId !== 'none' ? values.projectId : task.projectId,
    taskId: values.taskId !== 'none' ? values.taskId : undefined,
    StartDateLocal: `${values.date?.getFullYear()}-${values.date?.getMonth() + 1}-${values.date?.getDate()}`,
    StartTimeLocal: values.startTime
      ? values.startTime.includes('now')
        ? new Date().toLocaleTimeString('de-DE')
        : values.startTime
      : undefined,
    Duration: convertDurationsToSeconds(values.duration),
    isBillable: values.isBillable
  })

  await fetch(`${baseURL}/timeentries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getToken()}`
    },
    body: body,
    redirect: 'follow'
  }).catch((e: Error) => {
    showToast({ style: Toast.Style.Failure, title: e.name, message: e.message })
    console.log(e)
    return
  })
  await showHUD('Successfully booked time')
}

const validateDuration = (newDuration: string | undefined) => {
  if (!newDuration) {
    return 'Please enter duration'
  }
  if (
    !newDuration.match(
      /(^[0-5]?\dm$)|(^\d+h$)|(^\d+h *[0-5]?\dm$)|(^\d+:[0-5]\d$)|(^\d+[,|.]\d+$)/i
    )
  ) {
    return 'Please enter valid duration'
  }
  return
}

const convertDurationsToSeconds = (duration: string) => {
  duration = duration.toLowerCase()
  if (duration.match(/^[0-5]?\dm$/)) {
    return Number(duration.slice(0, duration.length - 1)) * 60
  } else if (duration.match(/(^\d+h$)/)) {
    return Number(duration.slice(0, duration.length - 1)) * 60 * 60
  } else if (duration.match(/(^\d+h *[0-5]?\dm$)/)) {
    const posH = duration.indexOf('h')
    const posM = duration.indexOf('m')
    const hours = Number(duration.slice(0, posH))
    const minutes = Number(duration.slice(posH + 1, posM))
    return hours * 60 * 60 + minutes * 60
  } else if (duration.match(/(^\d+:[0-5]\d$)/)) {
    const [hours, minutes] = duration.split(':').map((value) => Number(value))
    return hours * 60 * 60 + minutes * 60
  } else if (duration.match(/(^\d+[,|.]\d+$)/)) {
    return Number(duration.replace(',', '.')) * 60 * 60
  }
  throw new Error('Unexpected Duration')
}

export default function Command(props: LaunchProps) {
  const { data: projects, isLoading: isLoadingProjects } = usePromise(
    getProjects,
    [],
    {
      onData: () => {
        if (props.launchContext?.projectId) {
          setValue('projectId', props.launchContext.projectId)
        }
        if (props.draftValues?.projectId) {
          setValue('projectId', props.draftValues.projectId)
        }
      }
    }
  )
  const { data: tasks, isLoading: isLoadingTasks } = usePromise(getTasks, [], {
    onData: () => {
      if (props.launchContext?.taskId) {
        setValue('taskId', props.launchContext.taskId)
      }
      if (props.draftValues?.taskId) {
        setValue('taskId', props.draftValues.taskId)
      }
    }
  })
  const { data: typesOfWork, isLoading: isLoadingTypesOwWork } = usePromise(
    getTypesOfWork,
    [],
    {
      onData: () => {
        if (props.launchContext?.typeOfWorkId) {
          setValue('typeOfWorkId', props.launchContext.typeOfWorkId)
        }
        if (props.draftValues?.typeOfWorkId) {
          setValue('typeOfWorkId', props.draftValues.typeOfWorkId)
        }
      }
    }
  )
  const { pop } = useNavigation()

  const { handleSubmit, itemProps, setValidationError, setValue, values } =
    useForm<FormValues>({
      onSubmit: async (values) => {
        await bookTime(values, tasks)
        pop()
      },
      initialValues: {
        date: new Date(),
        isBillable: true,
        ...props.draftValues
      },
      validation: {
        projectId: (value) => {
          setValidationError('projectId', undefined)
          if ((!value || value === 'none') && values.taskId === 'none') {
            return 'Please select a project'
          }
        },
        typeOfWorkId: FormValidation.Required,
        date: FormValidation.Required,
        duration: validateDuration,
        startTime: (value) => {
          if (value) {
            if (value.match(/^ *(([0-1]\d)|(2[0-3])):[0-5]\d *$/)) {
              return
            } else if (value.match(/^ *now *$/i)) {
              return
            }
            return 'Please use format hh:mm'
          }
        }
      }
    })

  return (
    <Form enableDrafts={true} isLoading={isLoadingTypesOwWork || isLoadingProjects || isLoadingTasks} actions={
      <ActionPanel>
        <Action.SubmitForm onSubmit={handleSubmit}></Action.SubmitForm>
      </ActionPanel>
    }>
      <Form.TextField title={'Note'} {...itemProps.note} />
      <Form.Dropdown title={'Project'} {...itemProps.projectId} onChange={(projectId) => {
        setValidationError('projectId', undefined)
        if (projectId) {
          setValue('projectId', projectId)
          const project = projects?.filter(
            (value) => value.id === projectId
          )[0]
          if (typeof project?.isBillableByDefault === 'boolean') {
            setValue('isBillable', project.isBillableByDefault)
          }
        }
      }}>
        <Form.Dropdown.Item key={'none'} title={'No Project'} value={'none'} />
        {projects && projects.map((project) => (
          <Form.Dropdown.Item key={project.id} title={project.name} value={project.id} />))}
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
        <Form.Dropdown.Item key={'none'} title={'No Task'} value={'none'} />
        {tasks && tasks.filter((task) => !itemProps.projectId || itemProps.projectId.value === 'none' || task.projectId.includes(itemProps.projectId.value || '')).map((task) => (
          <Form.Dropdown.Item key={task.id} title={task.name} value={task.id} />))}
      </Form.Dropdown>
      <Form.Dropdown title={'Type of work'} {...itemProps.typeOfWorkId}>
        {typesOfWork && typesOfWork.map((typeOfWork) => (
          <Form.Dropdown.Item key={typeOfWork.id} title={typeOfWork.name} value={typeOfWork.id} />))}
      </Form.Dropdown>
      <Form.DatePicker type={Form.DatePicker.Type.Date} {...itemProps.date} />
      <Form.TextField
        title={'Start time'}
        {...itemProps.startTime}
        info={'Format hh:mm'}
      />
      <Form.TextField title={'Duration'} {...itemProps.duration} />
      <Form.Checkbox {...itemProps.isBillable} label={'Billable'} />
    </Form>
  )
}
