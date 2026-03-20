/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Jenkins URL - Base URL of your Jenkins instance (e.g. https://jenkins.example.com) */
  "jenkinsUrl": string,
  /** Username - Jenkins username */
  "username": string,
  /** API Token - Jenkins API token (not your password) */
  "apiToken": string,
  /** Default Job Path - Optional job path to pre-select on open */
  "defaultJobPath"?: string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `trigger-build` command */
  export type TriggerBuild = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `trigger-build` command */
  export type TriggerBuild = {}
}

