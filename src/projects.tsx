import { Action, ActionPanel, Icon, launchCommand, LaunchType, List, LocalStorage } from '@raycast/api'
import { usePromise } from '@raycast/utils'
import { getProjects, project } from './composables/fetchData'

const Actions = (props: { projectID: string; isBillable: boolean }) => {
  const { data: BaseUrl } = usePromise(() =>
    LocalStorage.getItem<string>('URL')
  )

  return (
    <ActionPanel>
      <Action.OpenInBrowser url={`${BaseUrl}/projects/${props.projectID}`} />
      <Action.CopyToClipboard
        content={`${BaseUrl}/projects/${props.projectID}`}
      />
      <Action
        icon={Icon.Clock}
        title="Book Time"
        shortcut={{ modifiers: ['cmd', 'ctrl'], key: 'enter' }}
        onAction={async () => {
          await launchCommand({
            name: 'bookTime',
            type: LaunchType.UserInitiated,
            context: {
              projectId: props.projectID,
              isBillable: props.isBillable
            }
          })
        }}
      />
      <Action
        icon={Icon.BulletPoints}
        title={'Show tasks'}
        shortcut={{ modifiers: ['ctrl'], key: 'space' }}
        onAction={async () => {
          await launchCommand({
            name: 'tasks',
            type: LaunchType.UserInitiated,
            context: {
              projectId: props.projectID
            }
          })
        }}
      />
    </ActionPanel>
  )
}

const ProjectItem = (props: { project: project }) => {
  return (
    <List.Item
      title={props.project.name}
      subtitle={props.project.company?.name}
      actions={
        <Actions
          projectID={props.project.id}
          isBillable={props.project.isBillableByDefault}
        />
      }
    />
  )
}

export default function Command() {
  const { data: projects, isLoading } = usePromise(getProjects)

  return (
    <List isLoading={isLoading}>
      {projects &&
        projects.map((project) => (
          <ProjectItem key={project.id} project={project} />
        ))}
    </List>
  )
}
