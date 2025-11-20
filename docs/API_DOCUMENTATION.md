# Nostrlivery Driver Association API Documentation

## Table of Contents
1. [Overview](#overview)
2. [NostrService API](#nostrservice-api)
3. [Event Types](#event-types)
4. [WebSocket Implementation](#websocket-implementation)
5. [Error Handling](#error-handling)
6. [Configuration](#configuration)
7. [Examples](#examples)

## Overview

The Driver Association feature uses the Nostr protocol for real-time bidirectional communication between companies and drivers. This system implements ephemeral events (kind 20000) to enable instant messaging and association management.

## NostrService API

### Core Methods

#### `publishEphemeralEvent(kind: number, content: string, nsec?: string): Promise<void>`

Publishes an ephemeral event to the Nostr relay.

**Parameters:**
- `kind: number` - Event kind (20000 for ephemeral events)
- `content: string` - JSON stringified event content
- `nsec?: string` - Optional private key for signing (nsec format)

**Returns:** `Promise<void>`

**Example:**
```typescript
const content = JSON.stringify({
  type: "DRIVER_ASSOCIATION_REQUEST",
  driverNpub: "npub1std6zalcn9vajumm8j0gvxf82hqvjurnmnppqv99veluc3yg5j4sv40ntq"
});

await nostrService.publishEphemeralEvent(20000, content, companyNsec);
```

#### `subscribeToEphemeralEvents(onEvent: Function, onEose: Function): Promise<Function>`

Subscribes to ephemeral events using direct WebSocket connection.

**Parameters:**
- `onEvent: Function` - Callback for received events
- `onEose: Function` - Callback for end of stored events

**Returns:** `Promise<Function>` - Unsubscribe function

**Example:**
```typescript
const unsubscribe = await nostrService.subscribeToEphemeralEvents(
  (event) => {
    console.log("Received event:", event);
    // Handle event
  },
  () => {
    console.log("End of stored events");
  }
);

// Later, cleanup
unsubscribe();
```

#### `getProfile(npub: string): Promise<Profile | null>`

Fetches a user's profile from the Nostr relay.

**Parameters:**
- `npub: string` - Nostr public key in npub format

**Returns:** `Promise<Profile | null>`

**Example:**
```typescript
const profile = await nostrService.getProfile("npub1std6zalcn9vajumm8j0gvxf82hqvjurnmnppqv99veluc3yg5j4sv40ntq");
if (profile) {
  console.log("Name:", profile.name);
  console.log("Picture:", profile.picture);
}
```

### Profile Interface

```typescript
interface Profile {
  name?: string;
  picture?: string;
  about?: string;
  // Other profile fields
}
```

## Event Types

### DRIVER_ASSOCIATION_REQUEST

**Direction:** Company → Driver  
**Purpose:** Company requests association with a driver

**Content Structure:**
```typescript
{
  type: "DRIVER_ASSOCIATION_REQUEST",
  driverNpub: string  // Driver's npub
}
```

**Example:**
```json
{
  "type": "DRIVER_ASSOCIATION_REQUEST",
  "driverNpub": "npub1std6zalcn9vajumm8j0gvxf82hqvjurnmnppqv99veluc3yg5j4sv40ntq"
}
```

### DRIVER_ASSOCIATION_ACCEPTED

**Direction:** Driver → Company  
**Purpose:** Driver accepts company's association request

**Content Structure:**
```typescript
{
  type: "DRIVER_ASSOCIATION_ACCEPTED",
  companyPubkey: string,     // Company's public key
  driverNpub: string,        // Driver's npub
  originalRequestId: string  // ID of the original request
}
```

**Example:**
```json
{
  "type": "DRIVER_ASSOCIATION_ACCEPTED",
  "companyPubkey": "720ce7e6e4e6ffd4342e806050fa583a4ca11f7b0b4fea2fa0ad594f99cab7fd",
  "driverNpub": "npub1std6zalcn9vajumm8j0gvxf82hqvjurnmnppqv99veluc3yg5j4sv40ntq",
  "originalRequestId": "3e6007fe6fbdd17f9fd944e913ec4f9f4751546f475663964b507413e00da4e4"
}
```

### DRIVER_ASSOCIATION_REJECTED

**Direction:** Driver → Company  
**Purpose:** Driver rejects company's association request

**Content Structure:**
```typescript
{
  type: "DRIVER_ASSOCIATION_REJECTED",
  companyPubkey: string,     // Company's public key
  driverNpub: string,        // Driver's npub
  originalRequestId: string  // ID of the original request
}
```

## WebSocket Implementation

### Connection Details

- **Protocol:** WebSocket (ws://)
- **Relay URL:** `ws://127.0.0.1:7000`
- **Event Kind:** `20000` (ephemeral events)
- **Subscription Format:** `["REQ", "subscription-id", {"kinds": [20000], "limit": 50}]`

### Message Flow

#### Subscription Request
```json
[
  "REQ",
  "ephemeral-events-1757385727854",
  {
    "kinds": [20000],
    "limit": 50
  }
]
```

#### Event Response
```json
[
  "EVENT",
  "ephemeral-events-1757385727854",
  {
    "id": "event-id",
    "pubkey": "sender-public-key",
    "created_at": 1757385731,
    "kind": 20000,
    "tags": [],
    "content": "\"{\\\"type\\\":\\\"DRIVER_ASSOCIATION_REQUEST\\\",\\\"driverNpub\\\":\\\"npub1std6zalcn9vajumm8j0gvxf82hqvjurnmnppqv99veluc3yg5j4sv40ntq\\\"}\"",
    "sig": "signature"
  }
]
```

#### End of Stored Events
```json
["EOSE", "ephemeral-events-1757385727854"]
```

## Error Handling

### Common Error Scenarios

#### Connection Errors
```typescript
try {
  await nostrService.publishEphemeralEvent(20000, content, nsec);
} catch (error) {
  if (error.message.includes("Connection failed")) {
    console.error("Failed to connect to relay");
    // Handle connection error
  }
}
```

#### Signing Errors
```typescript
try {
  await nostrService.publishEphemeralEvent(20000, content, nsec);
} catch (error) {
  if (error.message.includes("invalid: Event invalid id")) {
    console.error("Event signing failed");
    // Handle signing error
  }
}
```

#### Subscription Errors
```typescript
try {
  const unsubscribe = await nostrService.subscribeToEphemeralEvents(onEvent, onEose);
} catch (error) {
  console.error("Subscription failed:", error);
  // Handle subscription error
}
```

### Fallback Mechanisms

1. **Local Logging**: Events are logged locally if relay publishing fails
2. **Retry Logic**: Automatic retry for connection failures
3. **Graceful Degradation**: UI continues to function even if real-time features fail

## Configuration

### Relay Configuration

Ensure your Nostr relay supports kind 20000 events:

```toml
# config.toml
[relay]
event_kind_allowlist = [0, 1, 2, 3, 4, 5, 6, 7, 8, 16, 40, 41, 42, 43, 44, 20000]
```

### Network Requirements

- **Relay URL**: `ws://127.0.0.1:7000`
- **Event Kind**: `20000` (ephemeral events)
- **WebSocket**: Direct WebSocket connections for subscriptions
- **Timeout**: 10 seconds for connection attempts

### Environment Variables

```typescript
const RELAY_URL = "ws://127.0.0.1:7000";
const EVENT_KIND = 20000;
const CONNECTION_TIMEOUT = 10000;
```

## Examples

### Complete Flow Example

#### 1. Company Sends Request
```typescript
// Company app
const requestContent = {
  type: "DRIVER_ASSOCIATION_REQUEST",
  driverNpub: "npub1std6zalcn9vajumm8j0gvxf82hqvjurnmnppqv99veluc3yg5j4sv40ntq"
};

try {
  await nostrService.publishEphemeralEvent(
    20000, 
    JSON.stringify(requestContent), 
    companyNsec
  );
  console.log("Request sent successfully");
} catch (error) {
  console.error("Failed to send request:", error);
}
```

#### 2. Driver Receives and Responds
```typescript
// Driver app
const unsubscribe = await nostrService.subscribeToEphemeralEvents(
  (event) => {
    try {
      let contentString = event.content;
      if (contentString.startsWith('"') && contentString.endsWith('"')) {
        contentString = JSON.parse(contentString);
      }
      
      const content = JSON.parse(contentString);
      
      if (content.type === "DRIVER_ASSOCIATION_REQUEST") {
        // Handle request
        handleAssociationRequest(event, content);
      }
    } catch (error) {
      console.error("Error parsing event:", error);
    }
  },
  () => {
    console.log("End of stored events");
  }
);

// Accept request
const responseContent = {
  type: "DRIVER_ASSOCIATION_ACCEPTED",
  companyPubkey: event.pubkey,
  driverNpub: content.driverNpub,
  originalRequestId: event.id
};

await nostrService.publishEphemeralEvent(
  20000, 
  JSON.stringify(responseContent), 
  driverNsec
);
```

#### 3. Company Receives Response
```typescript
// Company app
const unsubscribe = await nostrService.subscribeToEphemeralEvents(
  (event) => {
    try {
      let contentString = event.content;
      if (contentString.startsWith('"') && contentString.endsWith('"')) {
        contentString = JSON.parse(contentString);
      }
      
      const content = JSON.parse(contentString);
      
      if (content.type === "DRIVER_ASSOCIATION_ACCEPTED") {
        console.log("Driver accepted the request!");
        // Update UI
      } else if (content.type === "DRIVER_ASSOCIATION_REJECTED") {
        console.log("Driver rejected the request");
        // Update UI
      }
    } catch (error) {
      console.error("Error parsing response:", error);
    }
  },
  () => {
    console.log("End of stored events");
  }
);
```

### QR Code Integration

#### Generate QR Code (Driver)
```typescript
import { nip19 } from 'nostr-tools';

// Generate npub from nsec
const npub = nip19.npubEncode(publicKey);

// Display QR code
<QRCode value={npub} size={200} />
```

#### Scan QR Code (Company)
```typescript
// QR Scanner component
const handleQRScan = (data: string) => {
  if (data.startsWith('npub1')) {
    setDriverNpub(data);
    setShowQRScanner(false);
  } else {
    Alert.alert("Invalid QR Code", "Please scan a valid driver npub");
  }
};
```

## Troubleshooting

### Common Issues

1. **Events not received**: Check relay configuration and WebSocket connection
2. **Signing failures**: Verify nsec key format and validity
3. **Connection timeouts**: Check network connectivity and relay status
4. **Double-encoded JSON**: Handle both single and double-encoded content

### Debug Logging

Enable detailed logging for debugging:

```typescript
console.log("Publishing event:", { content, kind, timestamp });
console.log("Received event:", { id, kind, pubkey, content });
console.log("WebSocket status:", ws.readyState);
```

### Testing

Use the provided test scripts to verify functionality:

```bash
# Test relay connection
node test-driver-subscription.js

# Test event publishing
node verify-relay.js
```

## Security Considerations

1. **Private Key Management**: Store nsec keys securely
2. **Event Validation**: Validate all incoming events
3. **Rate Limiting**: Implement rate limiting for event publishing
4. **Error Handling**: Don't expose sensitive information in error messages

## Performance Optimization

1. **Connection Pooling**: Reuse WebSocket connections
2. **Event Filtering**: Filter events at the relay level
3. **Batch Processing**: Process multiple events together
4. **Memory Management**: Clean up subscriptions and event handlers
