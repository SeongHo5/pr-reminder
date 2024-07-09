import {Client, ReminderConfig} from "./types";
import {Context} from "@actions/github/lib/context";
import axios from "axios";
import {getPendingReviewerLists} from "./utils";

export async function doPullRequestRemind(client: Client, context: Context, reminderConfig: ReminderConfig) {
    const {owner, repo} = context.repo;
    const platform = reminderConfig.platform.toLowerCase();
    const webhookUrl = reminderConfig.webhookUrl;
    const pullRequests = await client.rest.pulls.list({
        owner,
        repo,
        state: 'open',
    });

    const now = new Date();
    const remindTimeToMilliseconds = reminderConfig.remindTime * 60 * 1000;
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
            return `- #${pr.number}: ${pr.title} (생성일: ${pr.created_at}) ${mentions}`;
        }));
        const message = `[PR 리마인더] 24시간 이상 리뷰를 기다리는 PR이 ${oldPRs.length}개 있어요! \n${contents.join('\n')}`;
        const payload = platform === 'slack'
            ? {text: message}
            : {content: message};

        await axios.post(webhookUrl, payload);
    }
}

