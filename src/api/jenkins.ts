import { RawJenkinsNode, JenkinsJob, ExtensionPreferences } from "../types";
import { normalizeJobStatus } from "../utils/status";
import { assertOk } from "../utils/errors";
import { getPreferenceValues } from "@raycast/api";

export function buildAuthHeader(username: string, apiToken: string): string {
  return "Basic " + Buffer.from(`${username}:${apiToken}`).toString("base64");
}

export function buildTree(depth: number): string {
  if (depth === 0) return "name,url,color,_class";
  const inner = buildTree(depth - 1);
  return `name,url,color,_class,jobs[${inner}]`;
}

export function flattenJobs(nodes: RawJenkinsNode[], parentPath = ""): JenkinsJob[] {
  return nodes.flatMap((node) => {
    const path = parentPath ? `${parentPath}/${node.name}` : node.name;
    const hasChildren = Array.isArray(node.jobs) && node.jobs.length > 0;
    const isMultiBranch = node._class?.includes("MultiBranch") ?? false;

    if (isMultiBranch && hasChildren) {
      return flattenJobs(node.jobs!, path);
    }
    if (isMultiBranch && !hasChildren) {
      return [];
    }
    if (hasChildren) {
      return flattenJobs(node.jobs!, path);
    }
    return [
      {
        name: node.name,
        url: node.url,
        path,
        status: normalizeJobStatus(node.color ?? "notbuilt"),
        _class: node._class,
      },
    ];
  });
}

export async function fetchJobTree(): Promise<JenkinsJob[]> {
  const { default: fetch } = await import("node-fetch");
  const prefs = getPreferenceValues<ExtensionPreferences>();
  const treeQuery = buildTree(6);
  const url = `${prefs.jenkinsUrl.replace(/\/$/, "")}/api/json?tree=jobs[${treeQuery}]`;
  const response = await fetch(url, {
    headers: { Authorization: buildAuthHeader(prefs.username, prefs.apiToken) },
    redirect: "manual",
  });
  assertOk(response as unknown as { ok: boolean; status: number });
  const data = (await response.json()) as { jobs: RawJenkinsNode[] };
  return flattenJobs(data.jobs ?? []);
}
