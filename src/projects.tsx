import {
  Action,
  ActionPanel,
  Icon,
  launchCommand,
  LaunchType,
  List,
  LocalStorage,
} from '@raycast/api'
import { usePromise } from '@raycast/utils'
import { useState } from 'react'
import { getProjects, project } from './composables/FetchData'

const Actions = (props: { projectID: string; isBillable: boolean }) => {
  const { data: BaseUrl } = usePromise(() =>
    LocalStorage.getItem<string>('URL'),
  )

  return (
    <ActionPanel>
      <Action.OpenInBrowser url={`${BaseUrl}/projects/${props.projectID}`} />
      <Action.CopyToClipboard
        content={`${BaseUrl}/projects/${props.projectID}`}
      />
      <Action.CopyToClipboard
        icon={Icon.Envelope}
        title="Copy Project Mail Address"
        content={`project-${props.projectID}@hello.awork.com`}
        shortcut={{ modifiers: ['ctrl'], key: 'e' }}
      />
      <Action
        icon={Icon.Clock}
        title="Log Time"
        shortcut={{ modifiers: ['cmd', 'ctrl'], key: 'enter' }}
        onAction={async () => {
          await launchCommand({
            name: 'logTime',
            type: LaunchType.UserInitiated,
            context: {
              projectId: props.projectID,
              isBillable: props.isBillable,
            },
          })
        }}
      />
      <Action
        icon={Icon.BulletPoints}
        title={'Show Tasks'}
        shortcut={{ modifiers: ['ctrl'], key: 'space' }}
        onAction={async () => {
          await launchCommand({
            name: 'tasks',
            type: LaunchType.UserInitiated,
            context: {
              projectId: props.projectID,
            },
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
  const [searchText, setSearchText] = useState<string | undefined>(undefined)
  const {
    data: projects,
    isLoading,
    revalidate: updateSearch,
  } = usePromise(getProjects, [searchText], {
    onData: (data) => {
      if (!data && !searchText) {
        updateSearch()
      }
    },
  })

  return (
    <List
      isLoading={isLoading}
      throttle
      onSearchTextChange={(inputText) => {
        setSearchText(inputText.length > 0 ? inputText : undefined)
        updateSearch()
      }}
    >
      {projects &&
        Array.isArray(projects) &&
        projects.map((project) => (
          <ProjectItem key={project.id} project={project} />
        ))}
    </List>
  )
}
