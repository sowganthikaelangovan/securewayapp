import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.secureway.app',
  appName: 'SecureWay',
  webDir: 'dist/client',
  server: {
    url: 'http://localhost:8080',
    cleartext: true
  }
};

export default config;
