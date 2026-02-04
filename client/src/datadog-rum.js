import { datadogRum } from '@datadog/browser-rum';

export function initDatadogRUM() {
  // Only initialize if we have the required config
  const applicationId = import.meta.env.VITE_DD_APPLICATION_ID;
  const clientToken = import.meta.env.VITE_DD_CLIENT_TOKEN;

  if (!applicationId || !clientToken) {
    console.warn('Datadog RUM not initialized: Missing APPLICATION_ID or CLIENT_TOKEN');
    return;
  }

  datadogRum.init({
    applicationId,
    clientToken,
    site: import.meta.env.VITE_DD_SITE || 'datadoghq.com',
    service: 'homer-bot-frontend',
    env: import.meta.env.VITE_DD_ENV || 'development',
    version: '1.0.0',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 100,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'mask-user-input',
  });

  // Start session replay recording
  datadogRum.startSessionReplayRecording();

  console.log('Datadog RUM initialized');
}

export { datadogRum };
