# PR Reminder For Slack & Discord

## Description
리뷰를 기다리느라 지치는 개발자들을 위한 PR 리마인더입니다.
<br>
설정한 시간보다 오래 리뷰를 받지 못한 PR이 있다면 웹훅 메세지를 보내요.
<br>
**Slack**과 **Discord**를 지원합니다.

## How to use
```yaml
name: PR Reminder
on:
  schedule:
    - cron: '0 3 * * *' # 12:00 Asia/Seoul

jobs:
  pr-reminder:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: read

    steps:
      - name: Run PR reminder
        uses: SeongHo5/pr-reminder@v1.3
        with:
          platform: slack
          webhook-url: ${{ secrets.WEBHOOK_URL }}
          remind-time: 24
```
- `platform`: 웹훅 알림을 받을 플랫폼을 선택합니다. (slack, discord)
- `webhook-url`: Slack 또는 Discord에서 생성한 웹훅 URL을 입력합니다.
- `remind-time`: 리마인드 대상이 되는 PR의 최대 대기 시간을 입력합니다. (단위: 시간)

### Notes
- `schedule`으로 스케줄 설정을 하는 경우, cron 표현식은 반드시 **UTC** 기준으로 작성 해주세요.
  - 한국 시간(KST)은 UTC보다 **9시간** 빠릅니다. 따라서, 한국 시간 12시에 리마인드 알림을 받고 싶다면, UTC 기준 3시로 설정해야 합니다.
- Workflow가 PR 정보를 읽어오려면, `permissions`의 `pull-requests: read`를 필수로 입력해야 합니다. 
- `webhook-url`은 GitHub Secrets에 저장하여 사용하는 것을 권장합니다.
