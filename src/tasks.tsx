import {Action, ActionPanel, Icon, launchCommand, LaunchType, List, LocalStorage} from '@raycast/api';
import {usePromise} from '@raycast/utils';
import {getTasks, task} from './composables/fetchData';
import {logOut} from './composables/WebClient';

const Actions = (props: { taskId: string, projectId: string, typeOfWorkId: string | undefined }) => {
  const {data: BaseUrl} = usePromise(() => LocalStorage.getItem<string>('URL'))

  return (
    <ActionPanel>
      <Action.OpenInBrowser url={`${BaseUrl}/tasks/${props.taskId}`}/>
      <Action.CopyToClipboard content={`${BaseUrl}/tasks/${props.taskId}`}/>
      <Action icon={Icon.Clock} title='Book time' shortcut={{modifiers: ['ctrl', 'cmd'], key: 'enter'}} onAction={async () => {
        await launchCommand({
          name: 'bookTime', type: LaunchType.UserInitiated, context: {
            taskId: props.taskId,
            projectId: props.projectId,
            typeOfWorkId: props.typeOfWorkId,
          }
        })
      }}/>
      <Action icon={Icon.Logout} title='Log Out' onAction={logOut} shortcut={{modifiers: ['ctrl'], key: 'x'}}/>
    </ActionPanel>
  )
}

const TaskItem = (props: { task: task }) => {
  return (
    <List.Item
      title={props.task.name}
      subtitle={props.task.project.name}
      actions={<Actions taskId={props.task.id} projectId={props.task.projectId}
                        typeOfWorkId={props.task.typeOfWorkId}/>}
    />
  )
}

export default function Command() {
  const {data: tasks, isLoading} = usePromise(getTasks)
  return <List isLoading={isLoading}>
    {tasks && tasks.map((task) => <TaskItem key={task.id} task={task}/>)}
  </List>
}
