// Telnyx AI Assistant Voice Configuration
// Available voices for NaturalHD model

const TELNYX_NATURALHD_VOICES = {
  female: [
    'Astra',     // Current selection
    'Luna',
    'Stella',
    'Athena',
    'Hera',
    'Orion',
    'Artemis',
    'Asteria',
    'Rhea',
    'Phoebe'
  ],
  male: [
    'Arcas',
    'Evander', 
    'Orpheus',
    'Perseus',
    'Theseus',
    'Argus',
    'Castor',
    'Pollux',
    'Icarus',
    'Zephyr'
  ]
};

// Voice settings to test
const voiceSettings = {
  provider: 'Telnyx',
  model: 'NaturalHD',
  currentVoice: 'Astra',
  // Add these voices to test
  testVoices: ['Luna', 'Stella', 'Orpheus', 'Perseus']
};

export { TELNYX_NATURALHD_VOICES, voiceSettings };
