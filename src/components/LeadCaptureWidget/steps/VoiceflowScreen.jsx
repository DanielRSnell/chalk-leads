import React, { useEffect, useRef } from 'react';
import { useLeadStore } from '../../../storage/leadStore';

export function VoiceflowScreen() {
  const voiceflowRef = useRef(null);
  const { currentEstimate, calculateEstimate } = useLeadStore();

  // Ensure estimate is calculated before launching Voiceflow
  useEffect(() => {
    if (!currentEstimate) {
      console.log('Calculating estimate for Voiceflow...');
      calculateEstimate();
    }
  }, [currentEstimate, calculateEstimate]);

  useEffect(() => {
    // Wait for Voiceflow script to load, then launch chat
    const launchVoiceflow = () => {
      if (window.voiceflow && window.voiceflow.chat && voiceflowRef.current) {
        // Use lead data from window
        const leadData = window.leadData;

        // Store leadData to moovinleads_review in localStorage
        localStorage.setItem('moovinleads_review', JSON.stringify(window.leadData));

        window.voiceflow.chat.load({
          verify: { projectID: '68810d435cc97ae487533abe' },
          url: 'https://general-runtime.voiceflow.com',
          versionID: 'production',
          launch: {
            event: {
              type: 'launch',
              payload: {
                move: JSON.stringify(leadData)
              }
            }
          },
          voice: {
            url: "https://runtime-api.voiceflow.com"
          },
          render: {
            mode: 'embedded',
            target: voiceflowRef.current,
          },
          assistant: {
            stylesheet: "/wp-content/uploads/2025/07/style.css"
          },
          autostart: true,
        });
      } else {
        // Script not loaded yet or ref not ready, check again in 100ms
        setTimeout(launchVoiceflow, 100);
      }
    };

    launchVoiceflow();
  }, []);

  return (
    <div ref={voiceflowRef} id="voiceflow-move" className="absolute top-0 left-0 w-full h-full"></div>
  );
}