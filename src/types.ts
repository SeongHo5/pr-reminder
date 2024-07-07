import * as github from '@actions/github'

export type Client = ReturnType<typeof github.getOctokit>

export interface ConfigOption {
    owner: string;
    repo: string;
    ref: string;
}
