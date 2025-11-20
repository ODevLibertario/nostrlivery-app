# Nostrlivery Monorepo

This workspace contains three packages:

- `common`: Shared React Native components, screens, services, and utilities packaged as `@odevlibertario/nostrlivery-common`.
- `company`: Expo app for company users.
- `driver`: Expo app for drivers.

## Prerequisites

- Node.js 18+ (recommended) and npm 9+
- Android Studio or Xcode for running on devices/simulators (optional)
- Backend Nostr server running (see Backend Setup section below)

## First-time setup

1) Install dependencies (skip postinstall scripts that may fail outside RN toolchains):

```bash
# common
cd common
npm ci --ignore-scripts

# company
cd ../company
npm ci --ignore-scripts

# driver
cd ../driver
npm ci --ignore-scripts
```

2) Build and pack the shared library:

```bash
cd ../common
npm run build
npm pack
# Outputs: odevlibertario-nostrlivery-common-<version>.tgz
```

3) Install the packed tarball into apps:

```bash
# driver
cd ../driver
npm i --legacy-peer-deps ../common/odevlibertario-nostrlivery-common-*.tgz

# company
cd ../company
npm i --legacy-peer-deps ../common/odevlibertario-nostrlivery-common-*.tgz
```

**Note**: Use `--legacy-peer-deps` flag to resolve React version conflicts between the common package and apps.

## Backend Setup

The mobile apps require a backend Nostr server to be running. The current configuration expects:

- **API Server**: `http://127.0.0.1:3000`
- **Nostr Relay**: `ws://127.0.0.1:7000`
- **Node NPUB**: `npub1qpfswwjps7y8e5f89drhaxh8w3xjrzdh7dhmk7d764szg5gflywsl3lyad`

### Configuring Node and Relay IP Addresses

To change the node server IP or relay IP address, edit the configuration file:

**Location**: `common/src/config/app.config.ts`

```typescript
// Default configuration
const defaultConfig: AppConfig = {
  relay: {
    url: "ws://127.0.0.1:7000",  // Change this to your relay IP/URL
    timeout: 10000,
  },
  node: {
    url: "http://127.0.0.1:3000",  // Change this to your node server IP/URL
    timeout: 5000,
  },
  events: {
    associationRequestKind: 20000,
    limit: 50,
  },
};
```

**After changing the configuration:**
1. Rebuild the common package: `cd common && npm run build`
2. Repack the common package: `npm pack`
3. Reinstall in both apps (see "Rebuilding the shared `common` package" section below)

### Required Backend Endpoints:
- `GET /identity` - Returns the node's npub
- `GET /health` - Server health status
- `POST /entrypoint` - Accepts Nostr events for processing
- `GET /username/:npub` - Get username for a given npub
- `GET /driver/company-associations/:npub` - Get driver company associations

### Testing Backend Connection:
```bash
# Test API server
curl http://127.0.0.1:3000/identity
curl http://127.0.0.1:3000/health

# Should return:
# /identity: npub1qpfswwjps7y8e5f89drhaxh8w3xjrzdh7dhmk7d764szg5gflywsl3lyad
# /health: {"status":"healthy","timestamp":"..."}
```

## Running apps (Expo)

Because global `expo` may be unavailable, use the local CLI bundled with the `expo` package:

```bash
# company
cd company
node ./node_modules/expo/bin/cli start --clear

# driver (in another terminal)
cd driver
node ./node_modules/expo/bin/cli start --clear
```

- Press `a` for Android, `w` for web, or scan the QR with Expo Go.
- **Note**: Ensure the backend server is running before starting the mobile apps.

## Current Status ✅

Both mobile apps are now working and properly configured:
- **Driver App**: ✅ Working - connects to backend server at `127.0.0.1:3000`
- **Company App**: ✅ Working - connects to backend server at `127.0.0.1:3000`
- **Backend Server**: ✅ Running - API server on port 3000, Nostr relay on port 7000
- **Dependencies**: ✅ Resolved - React 19 compatibility with `--legacy-peer-deps`
- **Driver Association Feature**: ✅ Complete - Real-time bidirectional communication system

## Driver Association Feature 🚀

### Overview
A real-time driver association system that enables companies to send association requests to drivers and receive immediate responses using the Nostr protocol.

### Features
- **Real-time Communication**: Uses Nostr ephemeral events (kind 20000) for instant messaging
- **Bidirectional Flow**: Companies send requests → Drivers respond → Companies receive notifications
- **QR Code Integration**: Easy driver npub sharing via QR code scanning
- **Event Signing**: Proper cryptographic authentication with nsec keys
- **UI Integration**: Seamless integration into existing app workflows
- **Configuration Management**: Centralized configuration system for easy environment management

### How It Works

#### Company Side (Drivers Tab)
1. **Send Request**: Enter driver npub manually or scan QR code
2. **Profile Preview**: View driver profile before sending request
3. **Real-time Monitoring**: Listen for driver responses
4. **Response Display**: Show acceptance/rejection with timestamps

#### Driver Side (Companies Tab)
1. **Request Reception**: Real-time listening for association requests
2. **Request Management**: View and manage incoming requests
3. **Response Actions**: Accept or reject requests with touch buttons
4. **Association Tracking**: Manage accepted company associations

### Technical Implementation

#### Event Types
- `DRIVER_ASSOCIATION_REQUEST`: Company → Driver
- `DRIVER_ASSOCIATION_ACCEPTED`: Driver → Company
- `DRIVER_ASSOCIATION_REJECTED`: Driver → Company

#### Architecture
- **WebSocket Connections**: Direct WebSocket implementation for reliable subscriptions
- **Event Signing**: Proper nsec-based cryptographic signing
- **State Management**: Real-time UI updates with proper cleanup
- **Error Handling**: Comprehensive error handling and fallback mechanisms
- **Configuration System**: Centralized config management with environment support

### Configuration

#### Configuration Files
- **`common/src/config/app.config.ts`**: TypeScript configuration with validation (primary configuration file)
- **`config.json`**: JSON configuration for different environments (reference/example)
- **Environment Variables**: Support for production environment overrides

#### Node and Relay IP Configuration

**Location**: `common/src/config/app.config.ts` (lines 16-30)

This is where you configure the node server IP address and relay WebSocket URL. Both the driver and company apps use this shared configuration:

```typescript
// Default configuration
const defaultConfig: AppConfig = {
  relay: {
    url: "ws://127.0.0.1:7000",  // Nostr relay WebSocket URL
    timeout: 10000,
  },
  node: {
    url: "http://127.0.0.1:3000",  // Node API server HTTP URL
    timeout: 5000,
  },
  events: {
    associationRequestKind: 20000,
    limit: 50,
  },
};
```

**To change the IP addresses:**
1. Edit `common/src/config/app.config.ts`
2. Update the `url` values in `defaultConfig.relay.url` and `defaultConfig.node.url`
3. Rebuild and repack the common package (see "Rebuilding the shared `common` package" section)
4. Reinstall the updated package in both driver and company apps

**Example for network access:**
```typescript
node: {
  url: "http://192.168.1.199:3000",  // Use your machine's local IP
  timeout: 5000,
},
relay: {
  url: "ws://192.168.1.199:7000",  // Use your machine's local IP
  timeout: 10000,
},
```

#### Environment-Specific Configuration
- **Development**: Uses local IP addresses
- **Staging**: Uses staging servers
- **Production**: Uses production servers with environment variables

#### Relay Configuration
Ensure your Nostr relay supports kind 20000 events:
```toml
# config.toml
event_kind_allowlist = [0, 1, 2, 3, 4, 5, 6, 7, 8, 16, 40, 41, 42, 43, 44, 20000]
```

### Documentation

Complete documentation is available in the `docs/` folder:
- **[API Documentation](docs/API_DOCUMENTATION.md)**: Complete API reference
- **[Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md)**: System architecture details
- **[Quick Reference](docs/QUICK_REFERENCE.md)**: Quick start guide
- **[Documentation Index](docs/DOCUMENTATION_INDEX.md)**: Complete documentation overview

## SDK version alignment

Both apps are currently configured for Expo SDK 53 (React Native 0.79, React 19). If you see an SDK mismatch in Expo Go:

- Install Expo Go compatible with SDK 53 on your device, or
- Upgrade/downgrade the project using:

```bash
# Example upgrade to SDK 53
node ./node_modules/expo/bin/cli install expo@^53.0.0
node ./node_modules/expo/bin/cli install --fix
```

## Troubleshooting

### Backend Connection Issues:
- **"Failed to connect to node server" error**:
  - Verify backend server is running: `curl http://127.0.0.1:3000/health`
  - Check network connectivity: `ping 127.0.0.1`
  - **Configure the correct IP address** in `common/src/config/app.config.ts` (see "Configuring Node and Relay IP Addresses" section above)
  - Verify port 3000 is accessible (not 7000 for API calls)
  - After changing the IP, rebuild and reinstall the common package

- **Node selection screen shows empty float**:
  - This was fixed by auto-initializing the node URL and adding validation
  - Ensure the common package is rebuilt after changes

### Dependency Resolution Issues:
- **ERESOLVE dependency conflicts**:
  - Always use `--legacy-peer-deps` when installing the common package
  - This resolves React version conflicts between react-hook-form and React 19
  - Example: `npm i --legacy-peer-deps ../common/odevlibertario-nostrlivery-common-*.tgz`

### Expo Issues:
- Expo CLI not found:
  - Use the local binary: `node ./node_modules/expo/bin/cli <command>`.

- Metro caching or strange bundling errors:
  - Restart with `--clear` as shown above.

- PlatformConstants / TurboModule invariant errors:
  - Ensure a single version of `react` and `react-native` is installed. In `driver`, `package.json` uses `overrides` (npm) to force a single tree.
  - Reinstall: `npm install --legacy-peer-deps`.

- Web mode missing deps:
  - Install web packages per Expo prompt:

```bash
npx expo install react-native-web react-dom @expo/metro-runtime
```

- Postinstall script failures (e.g., `react-native-storage`):
  - Install with `--ignore-scripts` as shown in setup, then run without that flag in a proper RN environment if needed for native linking.

## Rebuilding the shared `common` package

When `common` changes, rebuild and reinstall into apps:

```bash
cd common
npm run build
npm pack

cd ../driver
npm i --legacy-peer-deps ../common/odevlibertario-nostrlivery-common-*.tgz

cd ../company
npm i --legacy-peer-deps ../common/odevlibertario-nostrlivery-common-*.tgz
```

## Linting

```bash
# From each app or the common package
npm run lint
npm run lint:fix
```

## Directory layout

- `/common` — TypeScript source in `src`, compiled to `dist`, published as a tarball.
- `/company` — Expo app using the shared package.
- `/driver` — Expo app using the shared package.
