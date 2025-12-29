/* eslint-disable no-restricted-globals */
const cleanTextForCounting = (text) =>
    text.replace(/\|[0-9\.]+S?\|/g, '').replace(/\[PAUSE:.*?\]/g, '').replace(/\|/g, '');

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
};

self.onmessage = (event) => {
    const { id, type, paragraphs, settings } = event.data || {};
    if (type !== 'paragraphs') return;
    const results = (paragraphs || []).map((entry) => {
        const result = analyzeReadability(entry.text || '', settings || {});
        return { index: entry.index, text: entry.text || '', result };
    });
    self.postMessage({ id, results });
};
