// Patterns for console noise originating from other libraries.
const EXCLUSION_PATTERNS = {
  SDK_INFO: [
    /^Live2D(?:\s+(?:SDK\s+)?\d+\.\d+(?:\.\d+)?(?:_\d+)?)?/i,
    /^profile\s*:\s*\w+\s*$/i,
    /http:\/\/www\.pixijs\.com/i,
  ],
  CUBISM_CORE: [
    /\[CSM\]\[[IWEDF]\]/i,
  ],
  AUDIO_MOTION: [
    /^\[SoundManager\]\s+(?:Error\s+occurred\s+on|Failed\s+to|Unable\s+to|Cannot)/i,
    /^\[MotionManager(?:.*?)\]\s+(?:failed\s+to\s+play\saudio|error|unable\s+to)/i,
    /\[MotionManager\(\)\] Failed to load motion: .*/i,
  ],
  INTERNAL_CONFIG: [
    /^\s*\[PROFILE_NAME\]\s*=\s*[\w-]+\s*$/i,
    /^\s*\[USE_ADJUST_TRANSLATION\]\s*=\s*(?:true|false|TRUE|FALSE|0|1)\s*$/i,
    /^\s*\[USE_CACHED_POLYGON_IMAGE\]\s*=\s*(?:true|false|TRUE|FALSE|0|1)\s*$/i,
    /^\s*\[EXPAND_W\]\s*=\s*-?\d+(?:\.\d+)?\s*$/i,
  ],
  MISC: [
    /^_\$li : call _\$Ri\.update\(\) before _\$Ri\.draw\(\)/i,
  ],
};

const ALL_PATTERNS = Object.values(EXCLUSION_PATTERNS).flat();

// Toggle via the browser console: consoleDebug = true
const DEBUG_KEY = 'consoleDebug';

Object.defineProperty(window, 'consoleDebug', {
  get: () => localStorage.getItem(DEBUG_KEY) === 'true',
  set: (val) => localStorage.setItem(DEBUG_KEY, val ? 'true' : 'false'),
  configurable: true,
  enumerable:   true,
});

// Wraps a console method so that:
//  - In debug mode: all messages pass through with a stack trace appended.
//  - In normal mode: messages matching any exclusion pattern are dropped.
const wrapMethod = (original) => (...args) => {
  if (window.consoleDebug) {
    const trace = new Error().stack?.split('\n')[2]?.trim() ?? 'Trace unavailable';
    original.apply(console, [...args, `\n ↳ ${trace}`]);
    return;
  }

  const msg = args.map(String).join(' ');
  if (!ALL_PATTERNS.some((pattern) => pattern.test(msg))) {
    original.apply(console, args);
  }
};

console.log   = wrapMethod(console.log);
console.warn  = wrapMethod(console.warn);
console.error = wrapMethod(console.error);