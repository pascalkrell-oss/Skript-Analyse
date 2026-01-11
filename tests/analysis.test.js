const assert = require('assert');
const { analyzeReadability, getPausenTime } = require('../assets/analysis-utils');

const readability = analyzeReadability('Das ist z.B. ein Test. Noch ein Satz.');
assert.ok(readability.sentences.length > 0, 'sentences should not be empty');
assert.ok(readability.sentences.every((sentence) => !sentence.includes('@@')), 'sentences should not contain @@ after abbreviation handling');

const pauseText = 'Hallo |1S| Welt | [PAUSE:1.5] Text |';
assert.strictEqual(getPausenTime(pauseText), 3.5, 'mixed pause markers should sum correctly');

console.log('All tests passed.');
