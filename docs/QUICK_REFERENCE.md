# Nostrlivery Driver Association - Quick Reference

## 🚀 Quick Start

### 1. Company Sends Request
```typescript
// Get company's nsec
const companyNsec = await storageService.get(StoredKey.NSEC);

// Create request
const request = {
  type: "DRIVER_ASSOCIATION_REQUEST",
  driverNpub: "npub1std6zalcn9vajumm8j0gvxf82hqvjurnmnppqv99veluc3yg5j4sv40ntq"
};

// Publish to relay
await nostrService.publishEphemeralEvent(20000, JSON.stringify(request), companyNsec);
```

### 2. Driver Responds
```typescript
// Get driver's nsec
const driverNsec = await storageService.get(StoredKey.NSEC);

// Create response
const response = {
  type: "DRIVER_ASSOCIATION_ACCEPTED", // or "DRIVER_ASSOCIATION_REJECTED"
  companyPubkey: "720ce7e6e4e6ffd4342e806050fa583a4ca11f7b0b4fea2fa0ad594f99cab7fd",
  driverNpub: "npub1std6zalcn9vajumm8j0gvxf82hqvjurnmnppqv99veluc3yg5j4sv40ntq",
  originalRequestId: "request-event-id"
};

// Publish to relay
await nostrService.publishEphemeralEvent(20000, JSON.stringify(response), driverNsec);
```

### 3. Listen for Events
```typescript
const unsubscribe = await nostrService.subscribeToEphemeralEvents(
  (event) => {
    // Handle received event
    console.log("Received:", event);
  },
  () => {
    console.log("End of stored events");
  }
);

// Cleanup
unsubscribe();
```

## 📋 Event Types

| Event Type | Direction | Purpose |
|------------|-----------|---------|
| `DRIVER_ASSOCIATION_REQUEST` | Company → Driver | Request association |
| `DRIVER_ASSOCIATION_ACCEPTED` | Driver → Company | Accept request |
| `DRIVER_ASSOCIATION_REJECTED` | Driver → Company | Reject request |

## 🔧 Configuration

### Relay Setup
```toml
# config.toml
event_kind_allowlist = [0, 1, 2, 3, 4, 5, 6, 7, 8, 16, 40, 41, 42, 43, 44, 20000]
```

### Network Settings
- **Relay URL**: `ws://127.0.0.1:7000`
- **Event Kind**: `20000`
- **Timeout**: `10000ms`

## 🐛 Common Issues

### Events Not Received
1. Check relay configuration includes kind 20000
2. Verify WebSocket connection status
3. Check network connectivity

### Signing Errors
1. Verify nsec key format
2. Check key storage in device
3. Ensure proper key permissions

### Connection Issues
1. Restart WebSocket connection
2. Check relay server status
3. Verify network configuration

## 📱 UI Components

### Company App
- **Drivers Tab**: Send requests, view responses
- **QR Scanner**: Scan driver npub
- **Response Display**: Show driver responses

### Driver App
- **Companies Tab**: View requests, manage associations
- **Profile Tab**: Display npub QR code
- **Request Modal**: Accept/reject requests

## 🔐 Security Checklist

- [ ] nsec keys stored securely
- [ ] Event signatures verified
- [ ] Input validation implemented
- [ ] Error messages don't expose sensitive data
- [ ] Rate limiting in place

## 📊 Monitoring

### Key Metrics
- Event publishing success rate
- WebSocket connection health
- Response time for events
- Error rates by type

### Logs to Watch
```
LOG Publishing ephemeral event to relay
LOG Ephemeral event published successfully
LOG Received event via WebSocket
LOG Error publishing ephemeral event
```

## 🚨 Error Codes

| Error | Cause | Solution |
|-------|-------|----------|
| `Connection failed` | WebSocket connection issue | Check network, restart connection |
| `Event invalid id` | Signing error | Verify nsec key, check format |
| `Could not parse command` | Relay communication error | Check relay configuration |
| `Double-encoded JSON` | Content parsing issue | Handle both encoding formats |

## 📚 File Locations

### Core Service
- `common/src/service/NostrService.ts`

### Company App
- `company/src/screens/AssociatedDrivers/index.tsx`
- `company/src/components/QRScanner.tsx`

### Driver App
- `driver/src/screens/Companies/index.tsx`
- `driver/src/screens/Profile/index.tsx`

## 🔄 Development Workflow

### 1. Make Changes
```bash
cd common
npm run build
npm pack
```

### 2. Update Apps
```bash
cd ../driver
npm i --legacy-peer-deps ../common/odevlibertario-nostrlivery-common-*.tgz

cd ../company
npm i --legacy-peer-deps ../common/odevlibertario-nostrlivery-common-*.tgz
```

### 3. Test
```bash
# Test relay connection
node test-driver-subscription.js

# Test event publishing
node verify-relay.js
```

## 📞 Support

### Debug Commands
```bash
# Check relay status
curl http://127.0.0.1:3000/health

# Test WebSocket connection
node test-driver-subscription.js

# Monitor relay logs
docker logs -f friendly_galileo
```

### Common Fixes
1. **Restart relay**: `docker restart friendly_galileo`
2. **Clear app cache**: `npx expo start --clear`
3. **Reinstall common**: Use `--legacy-peer-deps` flag
4. **Check network**: Verify IP addresses and ports
