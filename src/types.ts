import * as github from '@actions/github'

export type Client = ReturnType<typeof github.getOctokit>

export interface ConfigOption {
    owner: string;
    repo: string;
    path: string;
    ref: string;
}

export interface ReminderConfig {
    platform: string;
    webhookUrl: string;
    remindTime: number;
}
