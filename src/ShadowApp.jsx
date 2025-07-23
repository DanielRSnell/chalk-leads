import React, { useEffect } from 'react';
import { useLeadStore } from './storage/leadStore.js';
import { LeadCaptureWidget } from './components/LeadCaptureWidget/index.jsx';
import { FloatingActionButton } from './components/FloatingActionButton.jsx';

export function ShadowApp(props = {}) {
  // Extract props passed from PHP/server-side
  const {
    userRole = 'guest',
    siteUrl = window.location.origin,
    userId = 0,
    settings = {},
    apiNonce = '',
    pluginVersion = '1.0.0',
    isAdmin = false,
    theme = 'light',
    tailwindCSS = ''
  } = props;

  const { updateCompanyBranding } = useLeadStore();

  // Initialize server data and company branding from props
  useEffect(() => {
    // Set global WordPress data for API calls
    window.moovinleadsData = {
      userRole,
      siteUrl,
      userId,
      settings,
      nonce: apiNonce,
      pluginVersion,
      isAdmin,
      theme,
      apiUrl: siteUrl + '/wp-json/moovinleads/v1/'
    };

    // Update company branding if provided in settings
    if (settings.companyName || settings.companyLogo) {
      updateCompanyBranding({
        name: settings.companyName,
        logo: settings.companyLogo
      });
    }

    // Widget starts closed by default - no auto-open
  }, []);

  // Decode the base64 CSS content
  const decodedCSS = tailwindCSS ? atob(tailwindCSS) : '';

  return (
    <>
      {/* Inject Tailwind CSS directly as a style tag */}
      {decodedCSS && (
        <style dangerouslySetInnerHTML={{ __html: decodedCSS }} />
      )}
      
      {/* Floating Action Button */}
      <FloatingActionButton />
      
      {/* Lead Capture Widget */}
      <LeadCaptureWidget />
    </>
  );
}