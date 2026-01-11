/* eslint-disable no-restricted-globals */
let sharedUtils = self.SA_ANALYSIS_UTILS;
try {
    if (!sharedUtils && typeof importScripts === 'function') {
        importScripts(new URL('analysis-utils.js', self.location.href).href);
        sharedUtils = self.SA_ANALYSIS_UTILS;
    }
} catch (err) {
    sharedUtils = sharedUtils || null;
}

const cleanTextForCounting = sharedUtils?.cleanTextForCounting || ((text) =>
    text
        .replace(/\s*\|[0-9\.]+S?\|\s*/g, ' ')
        .replace(/\s*\[PAUSE:.*?\]\s*/g, ' ')
        .replace(/\s*\[[A-ZÄÖÜ]{2,}\]\s*/g, ' ')
        .replace(/\s*\|\s*/g, ' ')
        .replace(/\s+/g, ' ')
        .trim());

const parseConfigNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

let MAX_SENTENCE_LENGTH = 20;
let NOMINAL_CHAIN_THRESHOLD = 3;
let PASSIVE_VOICE_STRICTNESS = 15;

const applyAlgorithmConfig = (config = {}) => {
    MAX_SENTENCE_LENGTH = parseConfigNumber(config.longSentenceThreshold, MAX_SENTENCE_LENGTH);
    NOMINAL_CHAIN_THRESHOLD = parseConfigNumber(config.nominalChainThreshold, NOMINAL_CHAIN_THRESHOLD);
    PASSIVE_VOICE_STRICTNESS = parseConfigNumber(config.passiveVoiceStrictness, PASSIVE_VOICE_STRICTNESS);
};

const countSyllables = sharedUtils?.countSyllables || ((word) => {
    const clean = word.toLowerCase().replace(/[^a-zäöüß]/g, '');
    if (!clean) return 0;
    if (clean.length <= 3) return 1;
    const normalized = clean.replace(/(?:eu|au|ei|ie|äu|oi)/g, 'a');
    const matches = normalized.match(/[aeiouäöü]/g);
    return matches ? matches.length : 1;
});

const expandNumbersForAudio = sharedUtils?.expandNumbersForAudio || ((text) => {
    const toWords = (num) => {
        const units = ['null','eins','zwei','drei','vier','fünf','sechs','sieben','acht','neun','zehn','elf','zwölf','dreizehn','vierzehn','fünfzehn','sechzehn','siebzehn','achtzehn','neunzehn'];
        const tens = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];
        if (num < 20) return units[num];
        if (num < 100) {
            const t = Math.floor(num / 10);
            const u = num % 10;
            if (u === 0) return tens[t];
            const unit = u === 1 ? 'ein' : units[u];
            return `${unit}und${tens[t]}`;
        }
        if (num < 1000) {
            const h = Math.floor(num / 100);
            const r = num % 100;
            const head = h === 1 ? 'einhundert' : `${units[h]}hundert`;
            return r === 0 ? head : `${head}${toWords(r)}`;
        }
        if (num < 10000) {
            const th = Math.floor(num / 1000);
            const r = num % 1000;
            const head = th === 1 ? 'eintausend' : `${units[th]}tausend`;
            return r === 0 ? head : `${head}${toWords(r)}`;
        }
        return String(num).split('').map(d => units[parseInt(d, 10)]).join(' ');
    };

    const normalize = (match) => {
        const cleaned = match.replace(/\./g, '').replace(',', '.');
        const hasPercent = /%$/.test(match);
        const numeric = parseFloat(cleaned.replace('%', ''));
        if (Number.isNaN(numeric)) return match;
        const [intPart, decPart] = cleaned.replace('%', '').split('.');
        let spoken = toWords(parseInt(intPart, 10));
        if (decPart) {
            const decWords = decPart.split('').map(d => toWords(parseInt(d, 10))).join(' ');
            spoken = `${spoken} komma ${decWords}`;
        }
        if (hasPercent) spoken += ' prozent';
        return spoken;
    };

    return text.replace(/(\d{1,3}(?:\.\d{3})+|\d+)([.,]\d+)?%?/g, (m) => normalize(m));
});

const analyzeReadability = sharedUtils?.analyzeReadability || ((text, settings = {}) => {
    let clean = cleanTextForCounting(text).trim();
    if (settings.numberMode === 'word') {
        clean = expandNumbersForAudio(clean);
    }
    if (!clean) {
        return {
            score: 0,
            avgSentence: 0,
            syllablesPerWord: 0,
            wordCount: 0,
            speakingWordCount: 0,
            words: [],
            sentences: [],
            paragraphs: 0,
            maxSentenceWords: 0,
            totalSyllables: 0,
            cleanedText: ''
        };
    }

    let tempText = clean;
    const abbrevs = ['z.B.', 'ca.', 'bzw.', 'vgl.', 'inkl.', 'max.', 'min.', 'Dr.', 'Prof.', 'Hr.', 'Fr.', 'Nr.'];
    abbrevs.forEach((abbr) => {
        tempText = tempText.split(abbr).join(abbr.replace('.', '@@'));
    });

    const sentences = tempText
        .split(/[.!?]+(?=\s|$)/)
        .filter((s) => s.trim().length > 0)
        .map((s) => s.replace(/@@/g, '.'));
    const words = clean.split(/\s+/).filter((w) => w.length > 0);
    const wc = words.length;

    let speakingWordCount = 0;
    words.forEach((w) => {
        if (/[0-9]/.test(w)) {
            const digits = (w.match(/[0-9]/g) || []).length;
            if (digits >= 5) speakingWordCount += 4;
            else if (digits === 4) speakingWordCount += 3;
            else if (digits === 3) speakingWordCount += 2;
            else speakingWordCount += 1;
        } else {
            speakingWordCount += 1;
        }
    });

    const paragraphs = clean.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
    let maxSentenceWords = 0;
    sentences.forEach((s) => {
        const l = s.trim().split(/\s+/).length;
        if (l > maxSentenceWords) maxSentenceWords = l;
    });

    let totalSyllables = 0;
    words.forEach((w) => {
        totalSyllables += countSyllables(w);
    });

    const avgS = wc / (sentences.length || 1);
    const avgW = wc > 0 ? totalSyllables / wc : 0;
    const score = 180 - avgS - 58.5 * avgW;

    return {
        score: Math.max(0, Math.min(100, score)),
        avgSentence: avgS,
        syllablesPerWord: avgW,
        wordCount: wc,
        speakingWordCount,
        words,
        sentences,
        cleanedText: clean,
        paragraphs,
        maxSentenceWords,
        totalSyllables
    };
});

const analyzeKeywordClusters = sharedUtils?.analyzeKeywordClusters;
const findStumbles = sharedUtils?.findStumbles;
const analyzeRedundancy = sharedUtils?.analyzeRedundancy;
const PROFILE_CONFIG = sharedUtils?.PROFILE_CONFIG || {};

const resolveProfileConfig = (profile) => {
    if (!profile) return PROFILE_CONFIG.general || {};
    return PROFILE_CONFIG[profile] || PROFILE_CONFIG.general || {};
};

const getImmersionRegex = (() => {
    let cached = null;
    return () => {
        if (cached) return cached;
        const patterns = [
            'seh(?:e|st|t|en)',
            'sah(?:e|st|t|en)?',
            'sieht',
            'gesehen',
            'hör(?:e|st|t|en)',
            'hörte(?:st|t|n)?',
            'hörtet',
            'gehört',
            'riech(?:e|st|t|en)',
            'roch(?:e|st|t|en)?',
            'gerochen',
            'spür(?:e|st|t|en)',
            'spürte(?:st|t|n)?',
            'spürtet',
            'gespürt',
            'fühl(?:e|st|t|en)',
            'fühlte(?:st|t|n)?',
            'fühltet',
            'gefühlt',
            'bemerk(?:e|st|t|en)',
            'bemerkte(?:st|t|n)?',
            'bemerkt',
            'denk(?:e|st|t|en)',
            'dachte(?:st|t|n)?',
            'dachtet',
            'gedacht',
            'wiss(?:e|t|en)',
            'wusste(?:st|t|n)?',
            'wusstet',
            'gewusst',
            'realisier(?:e|st|t|en)',
            'realisierte(?:st|t|n)?',
            'realisiert',
            'frag(?:e|st|t|en)',
            'fragte(?:st|t|n)?',
            'fragtet',
            'gefragt'
        ];
        cached = new RegExp(`\\b(?:${patterns.join('|')})\\b`, 'gi');
        return cached;
    };
})();

const splitSentences = (text) => {
    if (!text) return [];
    let tempText = String(text);
    const abbrevs = ['z.B.', 'ca.', 'bzw.', 'vgl.', 'inkl.', 'max.', 'min.', 'Dr.', 'Prof.', 'Hr.', 'Fr.', 'Nr.'];
    abbrevs.forEach((abbr) => {
        tempText = tempText.split(abbr).join(abbr.replace('.', '@@'));
    });
    return tempText
        .split(/[.!?]+(?=\s|$)/)
        .filter((s) => s.trim().length > 0)
        .map((s) => s.replace(/@@/g, '.').trim());
};

const analyzeImmersion = (text) => {
    const clean = cleanTextForCounting(text || '');
    const words = clean.split(/\s+/).filter(Boolean);
    const totalWords = words.length;
    if (!totalWords) {
        return { totalWords: 0, hits: 0, density: 0, sentences: [], topWords: [] };
    }
    const regex = getImmersionRegex();
    const sentences = splitSentences(text || '');
    let hits = 0;
    const hitSentences = [];
    const wordCounts = {};

    sentences.forEach((sentence) => {
        regex.lastIndex = 0;
        const matches = sentence.match(regex);
        if (!matches || !matches.length) return;
        hitSentences.push(sentence);
        hits += matches.length;
        matches.forEach((match) => {
            const key = String(match).toLowerCase();
            wordCounts[key] = (wordCounts[key] || 0) + 1;
        });
    });

    const topWords = Object.entries(wordCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([word, count]) => ({ word, count }));

    const density = totalWords > 0 ? (hits / totalWords) * 100 : 0;
    return { totalWords, hits, density, sentences: hitSentences, topWords };
};

self.onmessage = (event) => {
    const { id, type, payload } = event.data || {};
    if (type === 'CONFIG') {
        applyAlgorithmConfig(payload || {});
        return;
    }
    if (!id || !type) return;
    if (type === 'paragraphs') {
        const { paragraphs, settings, profile } = payload || {};
        const profileConfig = resolveProfileConfig(profile || settings?.profile || settings?.role);
        const mergedSettings = {
            ...(settings || {}),
            numberMode: settings?.numberMode || profileConfig.numberMode
        };
        const result = (paragraphs || []).map((entry) => {
            const analysis = analyzeReadability(entry.text || '', mergedSettings);
            return { index: entry.index, text: entry.text || '', result: analysis };
        });
        self.postMessage({ id, type, result });
        return;
    }
    if (type === 'keyword_focus') {
        const { text, settings, stopwords, profile } = payload || {};
        const profileConfig = resolveProfileConfig(profile || settings?.profile || settings?.role);
        if (profileConfig.features && profileConfig.features.keywordFocus === false) {
            const result = { top: [], total: 0, focusScore: 0, focusKeywords: [], focusCounts: [], focusTotalCount: 0, focusDensity: 0, focusLimit: 0, focusOverLimit: false, totalWords: 0 };
            self.postMessage({ id, type, result });
            return;
        }
        const result = analyzeKeywordClusters
            ? analyzeKeywordClusters(text || '', settings || {}, stopwords || [])
            : { top: [], total: 0, focusScore: 0, focusKeywords: [], focusCounts: [], focusTotalCount: 0, focusDensity: 0, focusLimit: 0, focusOverLimit: false, totalWords: 0 };
        self.postMessage({ id, type, result });
        return;
    }
    if (type === 'stumble') {
        const { text, phonetics, profile } = payload || {};
        const profileConfig = resolveProfileConfig(profile);
        if (profileConfig.features && profileConfig.features.phonetics === false) {
            const result = { long: [], camel: [], phonetic: [], alliter: [], sibilant_warning: false, sibilant_density: 0, numberCount: 0, numberHint: '' };
            self.postMessage({ id, type, result });
            return;
        }
        const result = findStumbles
            ? findStumbles(text || '', phonetics || [])
            : { long: [], camel: [], phonetic: [], alliter: [], sibilant_warning: false, sibilant_density: 0, numberCount: 0, numberHint: '' };
        self.postMessage({ id, type, result });
        return;
    }
    if (type === 'redundancy') {
        const { sentences } = payload || {};
        const result = analyzeRedundancy ? analyzeRedundancy(sentences || []) : [];
        self.postMessage({ id, type, result });
        return;
    }
    if (type === 'immersion') {
        const { text } = payload || {};
        const result = analyzeImmersion(text || '');
        self.postMessage({ id, type, result });
    }
};
