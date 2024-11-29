import * as github from '@actions/github'

export type Client = ReturnType<typeof github.getOctokit>

export interface ReminderConfig {
    platform: string;
    webhookUrl: string;
    remindTime: number;
    skipOnWeekend: boolean;
    timeZone: string;
}
