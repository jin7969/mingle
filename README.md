# Mingle

Mingle is an MVP for watching an Amazon IVS live stream in a React Native app and showing IVS Chat messages in an OBS browser overlay.

## Workspace

- `apps/mobile`: Expo + React Native mobile app
- `apps/overlay`: React + Vite OBS browser overlay
- `services/chat-token`: AWS SAM Lambda for IVS Chat tokens

## Prerequisites

- Node.js 22.13 or newer in the Node 22 release line
- npm 10
- An Expo account for EAS development builds
- AWS CLI and AWS SAM CLI for infrastructure work
- OBS Studio for stream publishing and overlay verification

The IVS player is a native module, so Expo Go cannot run the final mobile app. Use an EAS development build or install Xcode/Android Studio for local native builds.

## Start

```bash
npm install
cp apps/mobile/.env.example apps/mobile/.env.local
cp apps/overlay/.env.example apps/overlay/.env.local
npm run dev:mobile
```

In another terminal:

```bash
npm run dev:overlay
```

## Checks

```bash
npm run check
```

See each workspace README for service-specific setup.

## Vendored dependency

`amazon-ivs-react-native-player@1.6.1` is vendored because its npm package contains repository-only lifecycle scripts that fail in consumer installs. The local patch removes only those scripts; see `vendor/amazon-ivs-react-native-player/MINGLE_PATCH.md`.
