// Styled console log tags per named context.
const LOG_STYLES = {
  SYSTEM: {
    tag:  'background:#1e90ff;color:white;font-weight:bold;border-radius:4px 10px 10px 4px;padding:2px 8px 2px 4px;',
    text: 'background:#4a6a8a;color:white;border-radius:0 4px 4px 0;padding:2px 4px 2px 2px;margin-left:-5px;',
  },
  MODEL: {
    tag:  'background:#8c5eff;color:white;font-weight:bold;border-radius:4px 10px 10px 4px;padding:2px 8px 2px 4px;',
    text: 'background:#6c608a;color:white;border-radius:0 4px 4px 0;padding:2px 4px 2px 2px;margin-left:-5px;',
  },
  UI: {
    tag:  'background:#ff67d7;color:white;font-weight:bold;border-radius:4px 10px 10px 4px;padding:2px 8px 2px 4px;',
    text: 'background:#8a5c7f;color:white;border-radius:0 4px 4px 0;padding:2px 4px 2px 2px;margin-left:-5px;',
  },
  INTERACTION: {
    tag:  'background:#2ecc71;color:white;font-weight:bold;border-radius:4px 10px 10px 4px;padding:2px 8px 2px 4px;',
    text: 'background:#4e8a68;color:white;border-radius:0 4px 4px 0;padding:2px 4px 2px 2px;margin-left:-5px;',
  },
  ERROR: {
    tag:  'background:#e74c3c;color:white;font-weight:bold;border-radius:4px 10px 10px 4px;padding:2px 8px 2px 4px;',
    text: 'background:#8a524c;color:#ffc9c5;border-radius:0 4px 4px 0;padding:2px 4px 2px 2px;margin-left:-5px;',
  },
  WARN: {
    tag:  'background:#f1c40f;color:black;font-weight:bold;border-radius:4px 10px 10px 4px;padding:2px 8px 2px 4px;',
    text: 'background:#8a7e4d;color:black;border-radius:0 4px 4px 0;padding:2px 4px 2px 2px;margin-left:-5px;',
  },
};

// Unknown contexts fall back to SYSTEM style.
export const log = (context, message, ...args) => {
  const key    = context.toUpperCase();
  const styles = LOG_STYLES[key] ?? LOG_STYLES.SYSTEM;
  console.log(`%c[${key}]%c ${message}`, styles.tag, styles.text, ...args);
};