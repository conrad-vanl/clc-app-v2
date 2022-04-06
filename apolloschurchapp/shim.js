import "@azure/core-asynciterator-polyfill";

// Android doesn't have BigInt type by default, and some deep node library requires it...
if (typeof BigInt === 'undefined') global.BigInt = require('big-integer');
