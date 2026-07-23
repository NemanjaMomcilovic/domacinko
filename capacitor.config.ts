import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tenkey.domacinko',
  appName: 'Domacinko',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    cleartext: false
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#2d8f5c'
  },
  plugins: {}
};

export default config;
