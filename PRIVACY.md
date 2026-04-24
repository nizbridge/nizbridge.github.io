# Privacy Policy — Claude Usage Tracker

*Last updated: April 2026*

Claude Usage Tracker does not collect, transmit, or share any personal data with any third party.

## Data Handling

| Data | Where it stays | Sent externally? |
|------|---------------|-----------------|
| Usage metrics (session %, weekly %, reset times) | Device only (`chrome.storage.local`) | No |
| User settings (thresholds, language, notification preferences) | Chrome sync storage (`chrome.storage.sync`) | No — governed by [Google's Privacy Policy](https://policies.google.com/privacy) |
| Claude.ai session cookies | Never read or stored by the extension | No — attached automatically by the browser on fetch requests |

## What the Extension Does

- Fetches usage data from `claude.ai` using your existing browser login session.
- Displays usage metrics locally in the browser toolbar badge and popup.
- Sends local browser notifications (toast or system notification) based on your settings.
- All processing happens entirely on your device. The extension has no backend server.

## What the Extension Does Not Do

- Does not read, store, or transmit authentication credentials or cookies.
- Does not track browsing history or website content.
- Does not use analytics, crash reporting, or any third-party SDK.
- Does not execute any remotely hosted code.

## Contact

If you have questions about this policy, please open an issue at the [GitHub repository](https://github.com/your-username/claudeEX).
