import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sofraai.app',
  appName: 'SofraAI',
  webDir: 'dist',
  server: { androidScheme: 'https' },
};

export default config;
