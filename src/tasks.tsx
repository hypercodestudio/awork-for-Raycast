import { Action, ActionPanel, Icon, launchCommand, LaunchProps, LaunchType, List, LocalStorage } from '@raycast/api'
import { usePromise } from '@raycast/utils'
import { useState } from 'react'
import { getProjects, getTasks, task } from './composables/fetchData'

const Actions = (props: {
  taskId: string
  projectId: string
  typeOfWorkId: string | undefined
}) => {
  const { data: BaseUrl } = usePromise(() =>
    LocalStorage.getItem<string>('URL')
  )

  return (
    <ActionPanel>
      <Action.OpenInBrowser url={`${BaseUrl}/tasks/${props.taskId}`} />
      <Action.CopyToClipboard content={`${BaseUrl}/tasks/${props.taskId}`} />
      <Action.CopyToClipboard
        title={'Copy taskId'}
        content={props.taskId}
        shortcut={{ modifiers: ['ctrl'], key: 'i' }}
      />
      <Action
        icon={Icon.Clock}
        title="Book time"
        shortcut={{ modifiers: ['ctrl', 'cmd'], key: 'enter' }}
        onAction={async () => {
          await launchCommand({
            name: 'bookTime',
            type: LaunchType.UserInitiated,
            context: {
              taskId: props.taskId,
              projectId: props.projectId,
              typeOfWorkId: props.typeOfWorkId
            }
          })
        }}
      />
    </ActionPanel>
  )
}

const TaskItem = (props: { task: task }) => {
  return (
    <List.Item
      title={props.task.name}
      subtitle={props.task.project.name}
      keywords={[props.task.project.name]}
      actions={
        <Actions
          taskId={props.task.id}
          projectId={props.task.projectId}
          typeOfWorkId={props.task.typeOfWorkId}
        />
      }
    />
  )
}

export default function Command(props: LaunchProps) {
  const { data: tasks, isLoading: isLoadingTasks } = usePromise(getTasks)
  const { data: projects, isLoading: iaLoadingProjects } = usePromise(
    getProjects,
    [],
    {
      onData: () => {
        if (props.launchContext?.projectId) {
          setProjectId(props.launchContext.projectId)
        }
      }
    }
  )
  const [projectId, setProjectId] = useState<string>('')

  return (
    <List
      isLoading={isLoadingTasks}
      searchBarAccessory={
        <List.Dropdown
          isLoading={iaLoadingProjects}
          tooltip={'Filter by project'}
          value={projectId}
          onChange={(newValue) => setProjectId(newValue)}
        >
          <List.Dropdown.Item title="All" value="" key={'all'} />
          {projects &&
            projects.map((project) => (
              <List.Dropdown.Item
                title={project.name}
                value={project.id}
                key={project.id}
              />
            ))}
        </List.Dropdown>
      }
    >
      {tasks &&
        tasks
          .filter((value) => value.projectId.includes(projectId))
          .map((task) => <TaskItem key={task.id} task={task} />)}
    </List>
  )
}
