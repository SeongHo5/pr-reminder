import { Platform, ReminderConfig } from "./types";
import * as core from "@actions/core";

export async function fetchConfig(): Promise<ReminderConfig> {
  const rawPlatform = core
    .getInput("platform", { required: true })
    .toLowerCase();
  const webhookUrl = core.getInput("webhook-url", { required: true }) || "";
  const timeZone = core.getInput("time-zone") || "Asia/Seoul";
  const workHoursInput = core.getInput("work-hours");
  const remindTime = parseInt(core.getInput("remind-time")) || 24;
  const skipOnWeekend =
    core.getBooleanInput("skip-on-weekend", { required: false }) || true;

  if (!["slack", "discord", "github-comments"].includes(rawPlatform)) {
    throw new Error("Supported platforms: slack, discord, github-comments");
  }
  if (!validateWebhookUrl(webhookUrl)) {
    throw new Error("Webhook URL format is Invalid.");
  }
  if (isNaN(remindTime) || remindTime <= 0) {
    throw new Error("Remind Time MUST be a positive number.");
  }
  let workHours: { start: number; end: number } | undefined;
  if (workHoursInput) {
    const [start, end] = workHoursInput
      .split("-")
      .map((n) => parseInt(n.trim(), 10));
    if (isNaN(start) || isNaN(end)) {
      throw new Error("Invalid `work-hours` format. Expected format: '9-18'");
    }
    workHours = { start, end };
  }

  return {
    platform: rawPlatform as Platform,
    webhookUrl,
    timeZone,
    remindTime,
    workHours,
    skipOnWeekend,
  };
}

const validateWebhookUrl = (url: string): boolean => {
  const urlRegex = /^(http|https):\/\/[^\s$.?#].\S*$/gm;
  return urlRegex.test(url);
};

const csvToArray = (value: string): string[] => {
  return value
    ? value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
    : [];
};
