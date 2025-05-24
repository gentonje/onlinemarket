
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.6fd7c32251764af79bcc7330aed69613',
  appName: 'onlinemarket',
  webDir: 'dist',
  server: {
    url: 'https://6fd7c322-5176-4af7-9bcc-7330aed69613.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: true,
      spinnerColor: '#fb923c'
    }
  }
};

export default config;
