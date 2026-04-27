# Privacy Policy — Claude Usage Tracker

*Last updated: April 2026*

Claude Usage Tracker does not collect, transmit, or share any personal data with any third party.
All data processing occurs locally on the user's device.

For the purposes of this policy, "personal data" refers to any information that can identify an individual user.

## Data Handling

| Data                                                           | Where it stays                                         | Sent externally?                                                                                                     |
| -------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Usage metrics (session %, weekly %, reset times)               | Device only (`chrome.storage.local`)                   | No                                                                                                                   |
| User settings (thresholds, language, notification preferences) | Stored via Chrome sync storage (`chrome.storage.sync`) | Synced across the user's browsers via their Google account; not transmitted to any external servers by the extension |
| Claude.ai session cookies                                      | Not accessed, read, or stored by the extension         | No — handled automatically by the browser                                                                            |

## What the Extension Does

* Fetches usage data from `claude.ai` using your existing browser login session.
* Displays usage metrics locally in the browser toolbar badge and popup.
* Sends optional browser notifications (toast or system notifications) based on user preferences.
* All processing happens on the user's device. The extension does not operate any backend server.

## What the Extension Does Not Do

* Does not access, read, store, or transmit authentication credentials or cookies.
* Does not track browsing history or website content.
* Does not use analytics, crash reporting, or any third-party SDK.
* Does not execute remotely hosted code.

## Permissions Used

| Permission      | Reason                                                                |
| --------------- | --------------------------------------------------------------------- |
| `storage`       | Stores usage metrics and user preferences locally and via Chrome sync |
| `notifications` | Displays optional usage alerts based on user-defined thresholds       |
| `alarms`        | Periodically updates usage metrics and triggers alerts                |

## Changes to This Policy

If this policy is updated, the "Last updated" date above will be revised. Continued use of the extension after any changes constitutes acceptance of the updated policy.

## Contact

If you have any questions about this Privacy Policy, you can contact us at:

* Email: nizbridge@gmail.com
