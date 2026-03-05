# Security & Privacy Architecture

## Overview
GitPulse AI is designed with a "Privacy First" and "Secure by Default" architecture. This document outlines the security measures implemented to protect user data and ensure application integrity.

## 1. Authentication & Authorization
- **Firebase Authentication**: All user identity management is handled by Firebase Auth (Google Sign-In / Email). We do not store passwords.
- **Strict Data Isolation**: 
  - `firestore.rules` are configured to strictly enforce that users can **only** read and write to their own document path (`/users/{userId}`).
  - Cross-user data access is cryptographically blocked at the database level.

```javascript
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

## 2. Infrastructure Security
- **Headers**: The generic `firebase.json` configuration enforces industry-standard security headers:
  - `Strict-Transport-Security` (HSTS): Forces HTTPS.
  - `X-Content-Type-Options: nosniff`: Prevents MIME-sniffing attacks.
  - `X-Frame-Options: SAMEORIGIN`: Prevents clickjacking.
  - `X-XSS-Protection`: Enables browser XSS filters.

## 3. Application Security (XSS Prevention)
- **Safe Rendering**: The application uses React's standard text rendering for all AI outputs (`FormattedResponse` component). 
- **No Dangerous HTML**: We explicitly avoid using `dangerouslySetInnerHTML` for displaying dynamic content, neutralizing potential Cross-Site Scripting (XSS) attacks from AI-generated text.
- **Input Sanitization**: All external links (Repositories, Sources) are validated to ensure they use safe protocols (`https://`) before being rendered as clickable anchors.

## 4. API Security
- **Environment Variables**: Sensitive keys (Perplexity API, Gemini API, Firebase Config) are stored in `.env.local` and accessed via `import.meta.env`.
- **GitIgnore**: `.env.local` and `node_modules` are excluded from version control to prevent accidental secret leakage.

## 5. Privacy
- **Data Minimization**: We only store essential data (Saved Stacks, Chat History) required for the user experience. All data is scoped to the user's UID.
- **No Third-Party Tracking**: The application does not include intrusive third-party analytics or tracking pixels.

## Future Recommendations
- Implement a Content Security Policy (CSP) `meta` tag in `index.html` for finer-grained control over script sources if external scripts are ever added.
