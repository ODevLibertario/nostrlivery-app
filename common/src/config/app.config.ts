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

// Default configuration
const defaultConfig: AppConfig = {
  relay: {
    url: "ws://127.0.0.1:7000",
    timeout: 10000,
  },
  node: {
    url: "http://127.0.0.1:3000",
    timeout: 5000,
  },
  events: {
    associationRequestKind: 20000,
    limit: 50,
  },
};

// Environment-specific overrides
const getEnvironmentConfig = (): Partial<AppConfig> => {
  // In production, these would come from environment variables
  if (process.env.NODE_ENV === 'production') {
    return {
      relay: {
        url: process.env.RELAY_URL || defaultConfig.relay.url,
        timeout: parseInt(process.env.RELAY_TIMEOUT || '10000'),
      },
      node: {
        url: process.env.NODE_URL || defaultConfig.node.url,
        timeout: parseInt(process.env.NODE_TIMEOUT || '5000'),
      },
    };
  }
  
  // Development overrides can be set here
  return {};
};

// Merge default config with environment overrides
export const appConfig: AppConfig = {
  ...defaultConfig,
  ...getEnvironmentConfig(),
};

// Configuration validation
export const validateConfig = (config: AppConfig): boolean => {
  try {
    // Validate relay URL
    if (!config.relay.url.startsWith('ws://') && !config.relay.url.startsWith('wss://')) {
      throw new Error('Relay URL must start with ws:// or wss://');
    }
    
    // Validate node URL
    if (!config.node.url.startsWith('http://') && !config.node.url.startsWith('https://')) {
      throw new Error('Node URL must start with http:// or https://');
    }
    
    // Validate timeouts
    if (config.relay.timeout <= 0 || config.node.timeout <= 0) {
      throw new Error('Timeouts must be positive numbers');
    }
    
    // Validate event kind
    if (config.events.associationRequestKind <= 0) {
      throw new Error('Association request kind must be positive');
    }
    
    return true;
  } catch (error) {
    console.error('Configuration validation failed:', error);
    return false;
  }
};

// Export individual config sections for convenience
export const relayConfig = appConfig.relay;
export const nodeConfig = appConfig.node;
export const eventConfig = appConfig.events;
