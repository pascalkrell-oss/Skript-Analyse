const cleanTextForCounting = (text) =>
    text
        .replace(/\s*\|[0-9\.]+S?\|\s*/g, ' ')
        .replace(/\s*\[PAUSE:.*?\]\s*/g, ' ')
        .replace(/\s*\[[^\]]+\]\s*/g, ' ')
        .replace(/\s*\|\s*/g, ' ')
        .replace(/[\u200B\uFEFF]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const countSyllables = (word) => {
    const clean = word.toLowerCase().replace(/[^a-zäöüß]/g, '');
    if (!clean) return 0;
    if (clean.length <= 3) return 1;
    const normalized = clean.replace(/(?:eu|au|ei|ie|äu|oi)/g, 'a');
    const matches = normalized.match(/[aeiouäöü]/g);
    return matches ? matches.length : 1;
};

const expandNumbersForAudio = (text) => {
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
};

const PROFILE_CONFIG = {
    general: {
        label: 'Allgemein',
        wpm: 180,
        numberMode: 'digit',
        commaPause: 0.2,
        periodPause: 0.5,
        paragraphPause: 1,
        sentenceWarningLimit: 25,
        hardSegmentLimit: 20,
        features: { keywordFocus: true, phonetics: true }
    },
    author: {
        label: 'Autor:in',
        wpm: 230,
        numberMode: 'digit',
        ignorePauseMarkers: true,
        commaPause: 0,
        periodPause: 0,
        paragraphPause: 0.5,
        sentenceWarningLimit: 25,
        criticalSentenceLimit: 30,
        hardSegmentLimit: 24,
        features: { keywordFocus: true, phonetics: false, immersion: true }
    },
    speaker: {
        label: 'Sprecher:in',
        wpm: 145,
        numberMode: 'word',
        commaPause: 0.35,
        periodPause: 0.7,
        paragraphPause: 1,
        sentenceWarningLimit: 22,
        hardSegmentLimit: 18,
        breathLabel: 'Keine Atempunkte',
        features: { keywordFocus: false, phonetics: true }
    },
    director: {
        label: 'Regie',
        wpm: 140,
        numberMode: 'word',
        commaPause: 0.3,
        periodPause: 0.6,
        paragraphPause: 1,
        pauseUnit: 'ms',
        sentenceWarningLimit: 25,
        hardSegmentLimit: 18,
        features: { keywordFocus: false, phonetics: true }
    },
    agency: {
        label: 'Agentur',
        wpm: 160,
        numberMode: 'digit',
        commaPause: 0.2,
        periodPause: 0.5,
        paragraphPause: 1,
        sentenceWarningLimit: 25,
        hardSegmentLimit: 20,
        features: { keywordFocus: false, phonetics: false }
    },
    marketing: {
        label: 'Marketing',
        wpm: 200,
        numberMode: 'digit',
        commaPause: 0.15,
        periodPause: 0.4,
        paragraphPause: 0.8,
        sentenceWarningLimit: 16,
        criticalSentenceLimit: 20,
        hardSegmentLimit: 18,
        sentimentTarget: 'positive',
        powerWordsCheck: true,
        features: { keywordFocus: true, phonetics: false }
    }
};

const resolveProfileConfig = (settings = {}) => {
    const profile = settings.profile || settings.role || settings.currentProfile || 'general';
    return PROFILE_CONFIG[profile] || PROFILE_CONFIG.general;
};

const analyzeReadability = (text, settings = {}) => {
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
            totalSyllables: 0
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
};

const analyzeKeywordClusters = (text, settings = {}, stopwords = []) => {
    if (!text || !text.trim()) {
        return { top: [], total: 0, focusScore: 0, focusKeywords: [], focusCounts: [], focusTotalCount: 0, focusDensity: 0, focusLimit: 0, focusOverLimit: false, totalWords: 0 };
    }
    const stopwordSet = new Set(stopwords || []);
    const counts = new Map();
    let total = 0;

    const cleanedText = cleanTextForCounting(text);
    const totalWords = cleanedText.match(/[A-Za-zÄÖÜäöüß0-9]+/g) || [];
    const focusKeywords = (settings.focusKeywords || '')
        .split(/[,|\n]/)
        .map(k => k.trim())
        .filter(Boolean);
    const focusCounts = [];
    let focusTotalCount = 0;

    focusKeywords.forEach(keyword => {
        const parts = keyword.split(/\s+/).filter(Boolean).map(escapeRegex);
        const pattern = parts.length ? parts.join('\\s+') : '';
        if (!pattern) return;
        const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
        const matches = cleanedText.match(regex) || [];
        const count = matches.length;
        focusTotalCount += count;
        focusCounts.push({ keyword, count });
    });

    const focusDensity = totalWords.length > 0 ? (focusTotalCount / totalWords.length) * 100 : 0;
    const focusLimit = Number.isFinite(parseFloat(settings.keywordDensityLimit)) ? parseFloat(settings.keywordDensityLimit) : 0;
    const focusOverLimit = focusLimit > 0 && focusDensity > focusLimit;

    const sentences = text.split(/[.!?]+/);
    sentences.forEach(sentence => {
        const words = sentence.match(/[A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß0-9-]*/g) || [];
        words.forEach((word, idx) => {
            let clean = word.replace(/^[^A-Za-zÄÖÜäöüß]+|[^A-Za-zÄÖÜäöüß0-9-]+$/g, '');
            if (!clean || clean.length < 3) return;

            const parts = clean.split('-').filter(Boolean);
            parts.forEach(part => {
                if (!part || part.length < 3) return;
                const lower = part.toLowerCase();
                if (stopwordSet.has(lower)) return;

                const isAllCaps = /^[A-ZÄÖÜ0-9]+$/.test(part) && part.length > 2;
                const hasUpperStart = /^[A-ZÄÖÜ]/.test(part);
                const hasInnerUpper = /[A-ZÄÖÜ].*[A-ZÄÖÜ]/.test(part);
                const isNounCandidate = isAllCaps || hasUpperStart || hasInnerUpper;
                if (!isNounCandidate) return;

                if (idx === 0 && stopwordSet.has(lower)) return;

                const display = isAllCaps ? part : part.charAt(0).toUpperCase() + part.slice(1);
                const key = lower;
                const entry = counts.get(key) || { word: display, count: 0 };
                entry.count += 1;
                counts.set(key, entry);
                total += 1;
            });
        });
    });

    const top = [...counts.values()].sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.word.localeCompare(b.word);
    });
    const topCount = top.length > 0 ? top[0].count : 0;
    const focusScore = total > 0 ? topCount / total : 0;
    return { top, total, focusScore, focusKeywords, focusCounts, focusTotalCount, focusDensity, focusLimit, focusOverLimit, totalWords: totalWords.length };
};

const findStumbles = (text, phonetics = []) => {
    const words = String(text || '').split(/\s+/).map(x => x.replace(/[.,;!?:"()]/g, ''));
    const result = { long: [], camel: [], phonetic: [], alliter: [], sibilant_warning: false, sibilant_density: 0, numberCount: 0, numberHint: '' };
    const phoneticRegex = phonetics.length ? new RegExp(`(${phonetics.join('|')})`, 'i') : null;
    const isNumberWord = (value) => /\d/.test(value) || /(zig|ßig|hundert)$/i.test(value);

    const sibilants = (String(text || '').toLowerCase().match(/([szßcx]|sch)/g) || []).length;
    const density = text && text.length > 0 ? (sibilants / text.length) * 100 : 0;
    if (density > 15) {
        result.sibilant_warning = true;
        result.sibilant_density = density.toFixed(1);
    }

    words.forEach(w => {
        const clean = w.toLowerCase().replace(/[^a-zäöüß0-9]/g, '');
        if (clean && isNumberWord(clean)) result.numberCount += 1;
        if (w.length >= 16) result.long.push(w);
        if (/[a-zäöüß][A-ZÄÖÜ]/.test(w)) result.camel.push(w);
        if (phoneticRegex && phoneticRegex.test(w)) result.phonetic.push(w);
    });

    for (let i = 0; i < words.length - 1; i++) {
        const w1 = words[i];
        const w2 = words[i + 1];
        if (!w1 || !w2) continue;
        const l1 = w1.toLowerCase();
        const l2 = w2.toLowerCase();
        if (i < words.length - 2) {
            const w3 = words[i + 2];
            if (w3) {
                const l3 = w3.toLowerCase();
                if (l1[0] === l2[0] && l2[0] === l3[0] && l1.length > 2) {
                    result.alliter.push(`${w1} ${w2} ${w3}`);
                }
            }
        }
        const cluster = /^(sch|st|sp|pf|ts|z)/;
        if (cluster.test(l1) && cluster.test(l2) && l1[0] === l2[0]) {
            result.alliter.push(`${w1} ${w2}`);
        }
    }
    result.long = [...new Set(result.long)];
    result.camel = [...new Set(result.camel)];
    result.phonetic = [...new Set(result.phonetic)];
    result.alliter = [...new Set(result.alliter)];
    if (result.numberCount > 5) {
        result.numberHint = 'Tipp: Achte bei den vielen Zahlen auf die Endung -ig (wird oft wie -ich gesprochen).';
    }
    return result;
};

const analyzeRedundancy = (sentences) => {
    if (!sentences || sentences.length < 2) return [];
    const stemWord = (word) => {
        let w = word.toLowerCase().replace(/[^a-zäöüß]/g, '');
        const suffixes = ['chen', 'lein', 'ungen', 'ung', 'heit', 'keit', 'isch', 'lich', 'end', 'ern', 'er', 'en', 'e', 's'];
        suffixes.forEach(s => {
            if (w.length > 4 && w.endsWith(s)) {
                w = w.slice(0, -s.length);
            }
        });
        return w;
    };
    const tokenize = (sentence) => {
        const words = sentence.match(/[A-Za-zÄÖÜäöüß]+/g) || [];
        return words.map(stemWord).filter(w => w.length > 2);
    };
    const levenshtein = (a, b) => {
        const m = a.length;
        const n = b.length;
        const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1,
                    dp[i - 1][j - 1] + cost
                );
            }
        }
        return dp[m][n];
    };

    const findings = [];
    for (let i = 0; i < sentences.length - 1; i++) {
        const first = sentences[i].trim();
        const second = sentences[i + 1].trim();
        const a = tokenize(first);
        const b = tokenize(second);
        if (a.length < 4 || b.length < 4) continue;
        const distance = levenshtein(a, b);
        const maxLen = Math.max(a.length, b.length);
        const similarity = maxLen > 0 ? 1 - (distance / maxLen) : 0;
        if (similarity >= 0.7) {
            findings.push({ first, second, similarity });
        }
    }
    return findings;
};

const getPausenTime = (text, settings = {}) => {
    let total = 0;
    const safeText = text || '';
    const cleaned = cleanTextForCounting(safeText);
    const profileConfig = resolveProfileConfig(settings);
    const ignoreMarkers = Boolean(profileConfig.ignorePauseMarkers || settings.ignorePauseMarkers);
    const pauseUnit = profileConfig.pauseUnit || 's';
    if (!ignoreMarkers) {
        const legacy = safeText.match(/\|([0-9\.]+)S?\|/g) || [];
        total += legacy.reduce((acc, m) => acc + (parseFloat(m.replace(/[^0-9.]/g, '')) || 0), 0);
        const newFormat = safeText.match(/\[PAUSE\s*:\s*([0-9]+(?:\.[0-9]+)?)(?:ms|s)?\]/gi) || [];
        total += newFormat.reduce((acc, m) => {
            const val = m.match(/([0-9]+(?:\.[0-9]+)?)/);
            if (!val) return acc;
            const rawVal = parseFloat(val[1]);
            if (Number.isNaN(rawVal)) return acc;
            const hasMs = /ms/i.test(m);
            const hasSec = /s/i.test(m);
            const seconds = hasMs ? rawVal / 1000 : (pauseUnit === 'ms' && !hasSec ? rawVal / 1000 : rawVal);
            return acc + seconds;
        }, 0);
        total += ((safeText.match(/\|/g) || []).length - legacy.length * 2) * 0.5;
    }
    const commaPause = parseFloat(settings.commaPause ?? profileConfig.commaPause ?? 0);
    const periodPause = parseFloat(settings.periodPause ?? profileConfig.periodPause ?? 0);
    const paragraphPause = parseFloat(settings.paragraphPause ?? profileConfig.paragraphPause ?? 0);
    if (commaPause > 0) {
        total += (cleaned.match(/,/g) || []).length * commaPause;
    }
    if (periodPause > 0) {
        total += (cleaned.match(/[.!?]/g) || []).length * periodPause;
    }
    if (paragraphPause > 0) {
        const paragraphBreaks = safeText.split(/\n\s*\n+/).length - 1;
        if (paragraphBreaks > 0) total += paragraphBreaks * paragraphPause;
    }
    return total;
};

const SA_ANALYSIS_UTILS = {
    analyzeReadability,
    analyzeKeywordClusters,
    analyzeRedundancy,
    countSyllables,
    cleanTextForCounting,
    escapeRegex,
    expandNumbersForAudio,
    findStumbles,
    getPausenTime,
    PROFILE_CONFIG
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SA_ANALYSIS_UTILS;
}
if (typeof window !== 'undefined') {
    window.SA_ANALYSIS_UTILS = SA_ANALYSIS_UTILS;
}
if (typeof self !== 'undefined') {
    self.SA_ANALYSIS_UTILS = SA_ANALYSIS_UTILS;
}
