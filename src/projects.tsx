import {Action, ActionPanel, Icon, List, LocalStorage} from '@raycast/api'
import {usePromise} from '@raycast/utils'
import {getProjects, project} from "./composables/fetchData";
import {logOut} from './composables/WebClient'

const Actions = (props: { projectID: string }) => {
  const {data: BaseUrl} = usePromise(() => LocalStorage.getItem<string>('URL'))

  return (
    <ActionPanel>
      <Action.OpenInBrowser url={`${BaseUrl}/projects/${props.projectID}`}/>
      <Action.CopyToClipboard content={`${BaseUrl}/projects/${props.projectID}`}/>
      <Action icon={Icon.Logout} title="Log Out" onAction={logOut} shortcut={{modifiers: ['ctrl'], key: 'x'}}/>
    </ActionPanel>
  )
}

const ProjectItem = (props: { project: project }) => {
  return (
    <List.Item
      title={props.project.name}
      subtitle={props.project.company?.name}
      actions={<Actions projectID={props.project.id}/>}
    />
  )
}

export default function Command() {
  const {data: projects, isLoading} = usePromise(getProjects)

  return <List isLoading={isLoading}>
    {projects && projects.map((project) => <ProjectItem key={project.id} project={project}/>)}
  </List>
}
