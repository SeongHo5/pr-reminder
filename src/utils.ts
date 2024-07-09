import {Client, ConfigOption, ReminderConfig} from "./types";
import {Context} from "@actions/github/lib/context";
import * as core from "@actions/core";

/**
 * 아직 리뷰를 진행하지 않은 리뷰어 목록을 가져옵니다.
 */
export async function getPendingReviewerLists(client: Client, context: Context): Promise<string[]> {
    const {owner, repo} = context.repo;
    const pr = context.payload.pull_request;

    const reviews = await client.rest.pulls.listRequestedReviewers({
        owner,
        repo,
        pull_number: context.issue.number,
    });

    const reviewers: string[] = pr.requested_reviewers.map((reviewer: { login: string }) => reviewer.login);
    const reviewedReviewers: string[] = reviews.data.users.map((reviewer: { login: string }) => reviewer.login);

    return reviewers.filter(reviewer => !reviewedReviewers.includes(reviewer));
}

export async function fetchConfig(): Promise<ReminderConfig> {
    const platform = core.getInput('platform', {required: true});
    const webhookUrl = core.getInput('webhook-url', {required: true});
    const remindTime = parseInt(core.getInput('remind-time', {required: true}));

    if (platform.toLowerCase() !== 'slack' && platform.toLowerCase() !== 'discord') {
        throw new Error('플랫폼은 slack 또는 discord만 지원합니다.');
    }
    if (!validateWebhookUrl(webhookUrl)) {
        throw new Error('Webhook URL 형식이 유효하지 않습니다.');
    }
    if (isNaN(remindTime)) {
        throw new Error('리마인드 시간은 숫자여야 합니다.');
    }
    return {
        platform,
        webhookUrl,
        remindTime
    };
}

function validateWebhookUrl(url: string): boolean {
    const urlRegex = /^(http|https):\/\/[^\s$.?#].\S*$/gm;
    return urlRegex.test(url);
}
