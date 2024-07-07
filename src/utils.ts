import {Client} from "./types";
import {Context} from "@actions/github/lib/context";

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

export function validateWebhookUrl(url: string): boolean {
    const urlRegex = /^(http|https):\/\/[^\s$.?#].\S*$/gm;
    return urlRegex.test(url);
}
