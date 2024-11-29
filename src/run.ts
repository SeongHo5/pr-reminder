import * as core from '@actions/core'
import * as github from '@actions/github'
import * as handler from './handler';
import * as utils from './utils';

export async function run() {
    try {
        const token = core.getInput('repo-token', {required: true});
        const client = github.getOctokit(token);
        const reminderConfig = await utils.fetchConfig();

        await handler.doPullRequestRemind(client, github.context, reminderConfig);
    } catch (error) {
        if (error instanceof Error) {
            core.debug(error.message);
            core.setFailed(error.message);
        }
    }
}
