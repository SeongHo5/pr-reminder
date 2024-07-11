import {Client, ReminderConfig} from "./types";
import {Context} from "@actions/github/lib/context";
import axios from "axios";
import {getPendingReviewerLists} from "./utils";

export async function doPullRequestRemind(client: Client, context: Context, reminderConfig: ReminderConfig) {
    const {owner, repo} = context.repo;
    const platform = reminderConfig.platform.toLowerCase();
    const webhookUrl = reminderConfig.webhookUrl;
    const remindTime = reminderConfig.remindTime ?? 24;
    const pullRequests = await client.rest.pulls.list({
        owner,
        repo,
        state: 'open',
    });

    const now = new Date();
    const remindTimeToMilliseconds = remindTime * 60 * 60 * 1000;
    const twentyFourHoursAgo = new Date(now.getTime() - remindTimeToMilliseconds);

    const oldPRs = pullRequests.data.filter(pr => {
        const createdAt = new Date(pr.created_at);
        const isAfterTwentyFourHours = createdAt < twentyFourHoursAgo;
        return !pr.merged_at && isAfterTwentyFourHours;
    });

    if (oldPRs.length > 0) {
        const contents = await Promise.all(oldPRs.map(async pr => {
            const pendingReviewers = await getPendingReviewerLists(client, context);
            const mentions = pendingReviewers.map(reviewer => `@${reviewer}`).join(' ');

            const createdAt = new Date(pr.created_at);
            const waitingTimeInHours = Math.floor((now.getTime() - createdAt.getTime()) / (60 * 60 * 1000));

            return `- [#${pr.number}](${pr.html_url}): ${pr.title} (${waitingTimeInHours}시간 동안 기다리는 중..) [${mentions}]`;
        }));
        const message = `[PR 리마인더] 24시간 이상 리뷰를 기다리는 PR이 ${oldPRs.length}개 있어요! \n${contents.join('\n')}`;
        const payload = platform === 'slack'
            ? {text: message}
            : {content: message};

        await axios.post(webhookUrl, payload);
    }
}

