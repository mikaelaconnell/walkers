// App Store reviewers cannot receive email codes, so this one account skips
// the send step; the verify screen checks their entered code against the
// account's stored password. The code itself is never in the app bundle.
export const REVIEW_EMAIL = 'review@walkersnewyork.com';
