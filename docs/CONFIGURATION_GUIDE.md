# Configuration Guide

## Overview

The Nostrlivery Driver Association system uses a centralized configuration system to manage environment-specific settings, making it easy to deploy across different environments without hardcoded values.

## Configuration Structure

### 1. TypeScript Configuration (`common/src/config/app.config.ts`)

The main configuration file provides type-safe configuration with validation:

```typescript
export interface AppConfig {
  relay: {
    url: string;
    timeout: number;
  };
  node: {
    url: string;
    timeout: number;
  };
  events: {
    associationRequestKind: number;
    limit: number;
  };
}
```

### 2. JSON Configuration (`config.json`)

Environment-specific configurations in JSON format:

```json
{
  "development": {
    "relay": {
      "url": "ws://127.0.0.1:7000",
      "timeout": 10000
    },
    "node": {
      "url": "http://127.0.0.1:3000",
      "timeout": 5000
    },
    "events": {
      "associationRequestKind": 20000,
      "limit": 50
    }
  }
}
```

## Environment Configuration

### Development Environment
- **Relay**: Local WebSocket server (`ws://127.0.0.1:7000`)
- **Node**: Local API server (`http://127.0.0.1:3000`)
- **Timeouts**: Shorter timeouts for faster development
- **Event Limit**: 50 events for testing

### Staging Environment
- **Relay**: Staging WebSocket server (`wss://staging-relay.example.com`)
- **Node**: Staging API server (`https://staging-api.example.com`)
- **Timeouts**: Medium timeouts for stability testing
- **Event Limit**: 75 events for moderate load testing

### Production Environment
- **Relay**: Production WebSocket server (`wss://relay.example.com`)
- **Node**: Production API server (`https://api.example.com`)
- **Timeouts**: Longer timeouts for reliability
- **Event Limit**: 100 events for production load

## Configuration Usage

### In Code
```typescript
import { appConfig, relayConfig, nodeConfig, eventConfig } from "../config/app.config";

// Use specific config sections
const relayUrl = relayConfig.url;
const nodeUrl = nodeConfig.url;
const eventKind = eventConfig.associationRequestKind;

// Use full config
const timeout = appConfig.relay.timeout;
```

### Environment Variables (Production)
```bash
# Set environment variables for production
export RELAY_URL="wss://production-relay.example.com"
export NODE_URL="https://production-api.example.com"
export RELAY_TIMEOUT="15000"
export NODE_TIMEOUT="10000"
```

## Configuration Validation

The configuration system includes built-in validation:

```typescript
import { validateConfig, appConfig } from "../config/app.config";

if (!validateConfig(appConfig)) {
  console.error("Invalid configuration detected");
  process.exit(1);
}
```

### Validation Rules
- **Relay URL**: Must start with `ws://` or `wss://`
- **Node URL**: Must start with `http://` or `https://`
- **Timeouts**: Must be positive numbers
- **Event Kind**: Must be positive number

## Changing Configuration

### For Development
1. Edit `common/src/config/app.config.ts`
2. Rebuild the common package:
   ```bash
   cd common
   npm run build
   npm pack
   ```
3. Reinstall in apps:
   ```bash
   cd ../driver
   npm i --legacy-peer-deps ../common/odevlibertario-nostrlivery-common-*.tgz
   
   cd ../company
   npm i --legacy-peer-deps ../common/odevlibertario-nostrlivery-common-*.tgz
   ```

### For Different Environments
1. Update `config.json` with environment-specific values
2. Set environment variables for production
3. Deploy with appropriate environment settings

## Configuration Best Practices

### 1. Environment Separation
- Keep development, staging, and production configs separate
- Use environment variables for sensitive production values
- Never commit production secrets to version control

### 2. Validation
- Always validate configuration on startup
- Provide clear error messages for invalid configurations
- Use TypeScript for compile-time validation

### 3. Defaults
- Provide sensible defaults for all configuration values
- Document all configuration options
- Make configuration optional where possible

### 4. Security
- Use secure protocols (wss://, https://) in production
- Store sensitive values in environment variables
- Validate all configuration inputs

## Troubleshooting Configuration

### Common Issues

#### 1. Configuration Not Loading
```bash
# Check if config file exists
ls -la common/src/config/app.config.ts

# Verify TypeScript compilation
cd common && npm run build
```

#### 2. Invalid URLs
```typescript
// Check URL format
console.log("Relay URL:", relayConfig.url);
console.log("Node URL:", nodeConfig.url);

// Validate URLs
if (!relayConfig.url.startsWith('ws')) {
  console.error("Invalid relay URL format");
}
```

#### 3. Timeout Issues
```typescript
// Check timeout values
console.log("Relay timeout:", relayConfig.timeout);
console.log("Node timeout:", nodeConfig.timeout);

// Adjust timeouts if needed
const customConfig = {
  ...appConfig,
  relay: { ...appConfig.relay, timeout: 15000 }
};
```

### Debug Configuration
```typescript
import { appConfig, validateConfig } from "../config/app.config";

console.log("Current configuration:", JSON.stringify(appConfig, null, 2));
console.log("Configuration valid:", validateConfig(appConfig));
```

## Migration from Hardcoded Values

### Before (Hardcoded)
```typescript
// Old hardcoded approach
const relayUrl = "ws://127.0.0.1:7000";
const nodeUrl = "http://127.0.0.1:3000";
const eventKind = 20000;
```

### After (Configuration)
```typescript
// New configuration approach
import { relayConfig, nodeConfig, eventConfig } from "../config/app.config";

const relayUrl = relayConfig.url;
const nodeUrl = nodeConfig.url;
const eventKind = eventConfig.associationRequestKind;
```

## Configuration Schema

### Complete Configuration Interface
```typescript
interface AppConfig {
  relay: {
    url: string;           // WebSocket URL (ws:// or wss://)
    timeout: number;       // Connection timeout in milliseconds
  };
  node: {
    url: string;           // HTTP API URL (http:// or https://)
    timeout: number;       // Request timeout in milliseconds
  };
  events: {
    associationRequestKind: number;  // Nostr event kind for associations
    limit: number;                   // Maximum events to fetch
  };
}
```

### Environment Variables
```bash
# Relay configuration
RELAY_URL=wss://relay.example.com
RELAY_TIMEOUT=15000

# Node configuration  
NODE_URL=https://api.example.com
NODE_TIMEOUT=10000

# Event configuration
ASSOCIATION_REQUEST_KIND=20000
EVENT_LIMIT=100
```

This configuration system provides a robust, scalable approach to managing environment-specific settings while maintaining type safety and validation.
