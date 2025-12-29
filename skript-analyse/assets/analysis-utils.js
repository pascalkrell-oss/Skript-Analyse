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

const analyzeReadability = (text) => {
    const clean = cleanTextForCounting(text).trim();
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

const getPausenTime = (text) => {
    let total = 0;
    const legacy = text.match(/\|([0-9\.]+)S?\|/g) || [];
    total += legacy.reduce((acc, m) => acc + (parseFloat(m.replace(/[^0-9.]/g, '')) || 0), 0);
    const newFormat = text.match(/\[PAUSE\s*:\s*([0-9]+(?:\.[0-9]+)?)(?:s)?\]/gi) || [];
    total += newFormat.reduce((acc, m) => {
        const val = m.match(/([0-9]+(?:\.[0-9]+)?)/);
        return acc + (val ? parseFloat(val[1]) : 0);
    }, 0);
    total += ((text.match(/\|/g) || []).length - legacy.length * 2) * 0.5;
    return total;
};

module.exports = {
    analyzeReadability,
    getPausenTime
};
