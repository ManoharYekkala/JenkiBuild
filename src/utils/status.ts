import { JobStatus } from "../types";

export function normalizeJobStatus(color: string): JobStatus {
  const isAnimated = color.endsWith("_anime");
  if (isAnimated) return "running";
  const base = color.replace(/_anime$/, "");
  switch (base) {
    case "blue":
      return "success";
    case "red":
      return "failure";
    case "aborted":
      return "aborted";
    case "disabled":
    case "notbuilt":
    case "grey":
      return "disabled";
    default:
      return "disabled";
  }
}
