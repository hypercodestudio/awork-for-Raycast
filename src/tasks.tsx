import {usePromise} from "@raycast/utils";
import {getTasks, project, task} from "./composables/fetchData";
import {Action, ActionPanel, Icon, List, LocalStorage} from "@raycast/api";
import {logOut} from "./composables/WebClient";

const Actions = (props: { taskId: string }) => {
  const {data: BaseUrl} = usePromise(() => LocalStorage.getItem<string>('URL'))

  return (
    <ActionPanel>
      <Action.OpenInBrowser url={`${BaseUrl}/tasks/${props.taskId}`}/>
      <Action.CopyToClipboard content={`${BaseUrl}/tasks/${props.taskId}`}/>
      <Action icon={Icon.Logout} title="Log Out" onAction={logOut} shortcut={{modifiers: ['ctrl'], key: 'x'}}/>
    </ActionPanel>
  )
}

const TaskItem = (props: { task: task }) => {
  return (
    <List.Item
      title={props.task.name}
      actions={<Actions taskId={props.task.id}/>}
    />
  )
}

export default function Command() {
  const {data: tasks, isLoading} = usePromise(getTasks)
  return <List isLoading={isLoading}>
    {tasks && tasks.map((task) => <TaskItem key={task.id} task={task}/>)}
  </List>
}
