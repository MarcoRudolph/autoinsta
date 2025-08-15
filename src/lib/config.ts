// Configuration file for AI-Chatbot settings

export const BOT_CONFIG = {
  // Default delay settings (in milliseconds)
  DELAYS: {
    MINIMUM: 5 * 60 * 1000, // 5 minutes
    MAXIMUM: 10 * 60 * 1000, // 10 minutes
    DEFAULT: 7.5 * 60 * 1000, // 7.5 minutes as default (middle of 5-10 range)
  },
  
  // Operating hours
  OPERATING_HOURS: {
    DEFAULT_START: '09:00',
    DEFAULT_END: '22:00',
  },
  
  // Response limits
  LIMITS: {
    DAILY_DM_RESPONSES: 100,
    DAILY_COMMENT_RESPONSES: 50,
    MAX_RESPONSES_PER_HOUR: 20,
  },
  
  // Content filtering
  FILTERS: {
    MAX_RESPONSE_LENGTH: 500,
    MIN_RESPONSE_LENGTH: 10,
  }
};

// Helper function to get random delay within range
export const getRandomDelay = (min: number = BOT_CONFIG.DELAYS.MINIMUM, max: number = BOT_CONFIG.DELAYS.MAXIMUM): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper function to convert minutes to milliseconds
export const minutesToMs = (minutes: number): number => {
  return minutes * 60 * 1000;
};

// Helper function to convert milliseconds to minutes
export const msToMinutes = (ms: number): number => {
  return Math.round(ms / (60 * 1000));
};
