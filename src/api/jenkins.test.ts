import { describe, it, expect } from "vitest";
import { buildTree, buildAuthHeader, flattenJobs } from "./jenkins";
import type { RawJenkinsNode } from "../types";

describe("buildTree", () => {
  it("buildTree(0) returns base fields only", () => {
    expect(buildTree(0)).toBe("name,url,color,_class");
  });

  it("buildTree(1) wraps with jobs[...]", () => {
    expect(buildTree(1)).toBe("name,url,color,_class,jobs[name,url,color,_class]");
  });

  it("buildTree(6) contains 6 levels of nested jobs[", () => {
    const result = buildTree(6);
    const matches = result.match(/jobs\[/g) ?? [];
    expect(matches.length).toBe(6);
  });
});

describe("buildAuthHeader", () => {
  it("returns Basic base64(user:token)", () => {
    const header = buildAuthHeader("user", "token");
    expect(header).toBe("Basic " + Buffer.from("user:token").toString("base64"));
  });
});

describe("flattenJobs", () => {
  it("returns empty array for empty input", () => {
    expect(flattenJobs([])).toEqual([]);
  });

  it("returns one JenkinsJob for a simple leaf node", () => {
    const nodes: RawJenkinsNode[] = [
      { name: "my-job", url: "http://jenkins/job/my-job/", color: "blue" },
    ];
    const result = flattenJobs(nodes);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      name: "my-job",
      url: "http://jenkins/job/my-job/",
      path: "my-job",
      status: "success",
    });
  });

  it("flattens nested folders and preserves path", () => {
    const nodes: RawJenkinsNode[] = [
      {
        name: "folder",
        url: "http://jenkins/job/folder/",
        jobs: [
          {
            name: "subfolder",
            url: "http://jenkins/job/folder/job/subfolder/",
            jobs: [
              {
                name: "leaf-job",
                url: "http://jenkins/job/folder/job/subfolder/job/leaf-job/",
                color: "red",
              },
            ],
          },
        ],
      },
    ];
    const result = flattenJobs(nodes);
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe("folder/subfolder/leaf-job");
    expect(result[0].status).toBe("failure");
  });

  it("filters out MultiBranch parents and includes their branch children", () => {
    const nodes: RawJenkinsNode[] = [
      {
        name: "my-multibranch",
        url: "http://jenkins/job/my-multibranch/",
        _class: "org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject",
        jobs: [
          {
            name: "main",
            url: "http://jenkins/job/my-multibranch/job/main/",
            color: "blue",
          },
          {
            name: "feature-x",
            url: "http://jenkins/job/my-multibranch/job/feature-x/",
            color: "red",
          },
        ],
      },
    ];
    const result = flattenJobs(nodes);
    expect(result).toHaveLength(2);
    expect(result[0].path).toBe("my-multibranch/main");
    expect(result[1].path).toBe("my-multibranch/feature-x");
  });

  it("returns empty array for MultiBranch parent with no children", () => {
    const nodes: RawJenkinsNode[] = [
      {
        name: "empty-multibranch",
        url: "http://jenkins/job/empty-multibranch/",
        _class: "org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject",
        jobs: [],
      },
    ];
    expect(flattenJobs(nodes)).toEqual([]);
  });
});
