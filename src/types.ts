import * as github from "@actions/github";

export type Client = ReturnType<typeof github.getOctokit>;

export type Platform = "slack" | "discord" | "github-comments";

export interface ReminderConfig {
  platform: Platform;
  webhookUrl: string;
  timeZone: string;
  remindTime: number;
  workHours?: { start: number; end: number };
  skipOnWeekend: boolean;
}
