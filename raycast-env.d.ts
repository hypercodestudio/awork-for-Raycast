/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Client ID - Enter the Client ID of your workspace */
  "clientId": string,
  /** Client Secret - Enter the Client Secret of your workspace */
  "clientSecret": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `projects` command */
  export type Projects = ExtensionPreferences & {}
  /** Preferences accessible in the `tasks` command */
  export type Tasks = ExtensionPreferences & {}
  /** Preferences accessible in the `logTime` command */
  export type LogTime = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `projects` command */
  export type Projects = {}
  /** Arguments passed to the `tasks` command */
  export type Tasks = {}
  /** Arguments passed to the `logTime` command */
  export type LogTime = {}
}

