(function () {
    'use strict';

    const ADJECTIVE_SUFFIXES = ['ig', 'lich', 'isch', 'haft', 'bar', 'sam', 'los'];
    const NOMINAL_SUFFIXES = ['ung', 'heit', 'keit', 'tion', 'schaft', 'tum', 'ismus', 'ling', 'nis', 'ät'];
    const PASSIVE_AUX = ['wurde', 'wurden', 'wird', 'werden', 'worden', 'geworden'];
    const PARTICIPLE_REGEX = /^(ge[a-zäöüß]{2,}(?:t|en)|[a-zäöüß]{3,}iert)$/i;

    const tokenizeWords = (text) => text.match(/[A-Za-zÄÖÜäöüß]+/g) || [];

    const tag = (text) => {
        const sentences = (text || '').split(/[.!?]+(?=\s|$)/);
        const terms = [];
        let termIndex = 0;

        sentences.forEach((sentence, sentenceIndex) => {
            const words = tokenizeWords(sentence);
            words.forEach((word, wordIndex) => {
                const normal = word.toLowerCase();
                const tags = {};

                if (ADJECTIVE_SUFFIXES.some((suffix) => normal.endsWith(suffix))) {
                    tags.Adjective = true;
                }

                if (
                    NOMINAL_SUFFIXES.some((suffix) => normal.endsWith(suffix)) ||
                    (word[0] === word[0].toUpperCase() && wordIndex !== 0)
                ) {
                    tags.Noun = true;
                }

                if (PASSIVE_AUX.includes(normal)) {
                    tags.Auxiliary = true;
                }

                if (PARTICIPLE_REGEX.test(normal)) {
                    tags.Participle = true;
                    tags.Verb = true;
                }

                if (normal.endsWith('en') || normal.endsWith('t')) {
                    tags.Verb = tags.Verb || true;
                }

                terms.push({
                    text: word,
                    normal,
                    tags,
                    sentenceIndex,
                    termIndex,
                    wordIndex
                });
                termIndex += 1;
            });
        });

        return { terms };
    };

    window.SkaPosTagger = { tag };
})();
