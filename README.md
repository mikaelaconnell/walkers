# Walkers New York

Members-only iOS app for a New York City walking club, built with Expo (React Native + expo-router) and Supabase.

## How it works

- Prospective members apply in the app; admins review and approve applications from an in-app admin area
- Sign-in is passwordless: members enter a one-time code sent by email
- Members browse upcoming walks, read recaps of past ones, and visit the club shop
- House rules and in-app reporting keep the community healthy

## Stack

- **App**: Expo + React Native, TypeScript, file-based navigation with expo-router
- **Backend**: Supabase (Postgres with row-level security policies, versioned migrations in `supabase/`)
- **Testing**: Jest + React Native Testing Library covering tab flows, admin screens, and components
- **Distribution**: EAS builds for the App Store

## Development

```bash
npm install
npx expo start   # run locally
npm test         # run the test suite
```
