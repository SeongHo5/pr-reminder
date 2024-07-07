import * as core from '@actions/core'
import * as github from '@actions/github'
import * as handler from './handler';
import {validateWebhookUrl} from './utils';

export async function run() {
    try {
        const token = core.getInput('repo-token', {required: true});
        const client = github.getOctokit(token);
        const webhookUrl = core.getInput('webhook-url', {required: true});

        if (!webhookUrl || !validateWebhookUrl(webhookUrl)) {
            core.setFailed('The Webhook URL is invalid.');
            return;
        }

        await handler.doPullRequestRemind(client, github.context, webhookUrl);
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
    }
}
