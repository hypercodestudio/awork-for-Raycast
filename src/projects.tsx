import {Action, ActionPanel, Icon, launchCommand, LaunchType, List, LocalStorage} from '@raycast/api'
import {usePromise} from '@raycast/utils'
import {getProjects, project} from "./composables/fetchData";
import {logOut} from './composables/WebClient'

const Actions = (props: { projectID: string, isBillable: boolean }) => {
  const {data: BaseUrl} = usePromise(() => LocalStorage.getItem<string>('URL'))

  return (
    <ActionPanel>
      <Action.OpenInBrowser url={`${BaseUrl}/projects/${props.projectID}`}/>
      <Action.CopyToClipboard content={`${BaseUrl}/projects/${props.projectID}`}/>
      <Action title='Book Time' onAction={async () => {
        await launchCommand({
          name: 'bookTime', type: LaunchType.UserInitiated, context: {
            projectId: props.projectID,
            isBillable: props.isBillable,
          }
        })
      }}/>
      <Action icon={Icon.Logout} title="Log Out" onAction={logOut} shortcut={{modifiers: ['ctrl'], key: 'x'}}/>
    </ActionPanel>
  )
}

const ProjectItem = (props: { project: project }) => {
  return (
    <List.Item
      title={props.project.name}
      subtitle={props.project.company?.name}
      actions={<Actions projectID={props.project.id} isBillable={props.project.isBillableByDefault}/>}
    />
  )
}

export default function Command() {
  const {data: projects, isLoading} = usePromise(getProjects)

  return <List isLoading={isLoading}>
    {projects && projects.map((project) => <ProjectItem key={project.id} project={project}/>)}
  </List>
}
