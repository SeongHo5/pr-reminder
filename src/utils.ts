import {Client, ConfigOption, ReminderConfig} from "./types";
import {Context} from "@actions/github/lib/context";
import * as core from "@actions/core";

/**
 * 아직 리뷰를 진행하지 않은 리뷰어 목록을 가져옵니다.
 */
export async function getPendingReviewerLists(client: Client, context: Context): Promise<string[]> {
    const {owner, repo} = context.repo;
    const pr = context.payload.pull_request;

    core.debug(`Fetching requested reviewers for PR #${pr.number}`);

    const reviews = await client.rest.pulls.listRequestedReviewers({
        owner,
        repo,
        pull_number: pr.number
    });

    const reviewers: string[] = pr.requested_reviewers.map((reviewer: { login: string }) => reviewer.login);
    const reviewedReviewers: string[] = reviews.data.users.map((reviewer: { login: string }) => reviewer.login);

    core.debug(`Requested reviewers: ${reviewers.join(', ')}`);
    core.debug(`Reviewed reviewers: ${reviewedReviewers.join(', ')}`);

    return reviewers.filter(reviewer => !reviewedReviewers.includes(reviewer));
}

export async function fetchConfig(): Promise<ReminderConfig> {
    const platform = core.getInput('platform', {required: true});
    const webhookUrl = core.getInput('webhook-url', {required: true});
    const remindTime = parseInt(core.getInput('remind-time')) || 24;
    const skipOnWeekend = core.getInput('skip-on-weekend') === 'true' || false;
    const timeZone = core.getInput('time-zone') || 'Asia/Seoul';

    if (platform.toLowerCase() !== 'slack' && platform.toLowerCase() !== 'discord') {
        throw new Error('Currently Slack & Discord are supported only.');
    }
    if (!validateWebhookUrl(webhookUrl)) {
        throw new Error('Webhook URL format is Invalid.');
    }
    if (isNaN(remindTime)) {
        throw new Error('Remine Time MUST be a number.');
    }

    return {
        platform,
        webhookUrl,
        remindTime,
        skipOnWeekend,
        timeZone
    };
}

function validateWebhookUrl(url: string): boolean {
    const urlRegex = /^(http|https):\/\/[^\s$.?#].\S*$/gm;
    return urlRegex.test(url);
}
