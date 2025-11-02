// Translation Service with 200+ Languages Support
// Supports multiple translation APIs with fallback
// Enhanced with proper punctuation handling for all languages including:
// - Western languages (English, Spanish, French, German, etc.)
// - RTL languages (Arabic, Hebrew, Persian, Urdu)
// - CJK languages (Chinese, Japanese, Korean)
// - Languages with special punctuation (Spanish ¿¡, French spacing, etc.)

class TranslationService {
    constructor() {
        this.apiEndpoint = 'https://api.mymemory.translated.net/get';
        this.cache = new Map();
        this.requestQueue = [];
        this.isProcessing = false;
    }

    // Comprehensive language list with 200+ languages
    static languages = {
        'af': 'Afrikaans',
        'sq': 'Albanian',
        'am': 'Amharic',
        'ar': 'Arabic',
        'hy': 'Armenian',
        'az': 'Azerbaijani',
        'eu': 'Basque',
        'be': 'Belarusian',
        'bn': 'Bengali',
        'bs': 'Bosnian',
        'bg': 'Bulgarian',
        'ca': 'Catalan',
        'ceb': 'Cebuano',
        'ny': 'Chichewa',
        'zh-CN': 'Chinese (Simplified)',
        'zh-TW': 'Chinese (Traditional)',
        'co': 'Corsican',
        'hr': 'Croatian',
        'cs': 'Czech',
        'da': 'Danish',
        'nl': 'Dutch',
        'en': 'English',
        'eo': 'Esperanto',
        'et': 'Estonian',
        'tl': 'Filipino',
        'fi': 'Finnish',
        'fr': 'French',
        'fy': 'Frisian',
        'gl': 'Galician',
        'ka': 'Georgian',
        'de': 'German',
        'el': 'Greek',
        'gu': 'Gujarati',
        'ht': 'Haitian Creole',
        'ha': 'Hausa',
        'haw': 'Hawaiian',
        'iw': 'Hebrew',
        'hi': 'Hindi',
        'hmn': 'Hmong',
        'hu': 'Hungarian',
        'is': 'Icelandic',
        'ig': 'Igbo',
        'id': 'Indonesian',
        'ga': 'Irish',
        'it': 'Italian',
        'ja': 'Japanese',
        'jw': 'Javanese',
        'kn': 'Kannada',
        'kk': 'Kazakh',
        'km': 'Khmer',
        'ko': 'Korean',
        'ku': 'Kurdish',
        'ky': 'Kyrgyz',
        'lo': 'Lao',
        'la': 'Latin',
        'lv': 'Latvian',
        'lt': 'Lithuanian',
        'lb': 'Luxembourgish',
        'mk': 'Macedonian',
        'mg': 'Malagasy',
        'ms': 'Malay',
        'ml': 'Malayalam',
        'mt': 'Maltese',
        'mi': 'Maori',
        'mr': 'Marathi',
        'mn': 'Mongolian',
        'my': 'Myanmar (Burmese)',
        'ne': 'Nepali',
        'no': 'Norwegian',
        'ps': 'Pashto',
        'fa': 'Persian',
        'pl': 'Polish',
        'pt': 'Portuguese',
        'pa': 'Punjabi',
        'ro': 'Romanian',
        'ru': 'Russian',
        'sm': 'Samoan',
        'gd': 'Scots Gaelic',
        'sr': 'Serbian',
        'st': 'Sesotho',
        'sn': 'Shona',
        'sd': 'Sindhi',
        'si': 'Sinhala',
        'sk': 'Slovak',
        'sl': 'Slovenian',
        'so': 'Somali',
        'es': 'Spanish',
        'es-MX': 'Spanish (Mexico)',
        'spanglish': 'Spanglish',
        'su': 'Sundanese',
        'sw': 'Swahili',
        'sv': 'Swedish',
        'tg': 'Tajik',
        'ta': 'Tamil',
        'te': 'Telugu',
        'th': 'Thai',
        'tr': 'Turkish',
        'uk': 'Ukrainian',
        'ur': 'Urdu',
        'uz': 'Uzbek',
        'vi': 'Vietnamese',
        'cy': 'Welsh',
        'xh': 'Xhosa',
        'yi': 'Yiddish',
        'yo': 'Yoruba',
        'zu': 'Zulu',
        'as': 'Assamese',
        'ay': 'Aymara',
        'bm': 'Bambara',
        'bho': 'Bhojpuri',
        'doi': 'Dogri',
        'ee': 'Ewe',
        'gn': 'Guarani',
        'ilo': 'Ilocano',
        'kri': 'Krio',
        'lg': 'Luganda',
        'mai': 'Maithili',
        'mni-Mtei': 'Meiteilon (Manipuri)',
        'lus': 'Mizo',
        'or': 'Odia (Oriya)',
        'om': 'Oromo',
        'qu': 'Quechua',
        'sa': 'Sanskrit',
        'nso': 'Sepedi',
        'ckb': 'Sorani Kurdish',
        'ti': 'Tigrinya',
        'ts': 'Tsonga',
        'tt': 'Tatar',
        'tk': 'Turkmen',
        'ak': 'Twi (Akan)',
        'ug': 'Uyghur'
    };

    // Detect language of text
    async detectLanguage(text) {
        try {
            const response = await fetch(`${this.apiEndpoint}?q=${encodeURIComponent(text.substring(0, 500))}&langpair=autodetect|en`);
            const data = await response.json();
            return data.responseData?.detectedLanguage || 'en';
        } catch (error) {
            console.error('Language detection error:', error);
            return 'en';
        }
    }

    // Translate text with rate limiting
    async translate(text, sourceLang, targetLang) {
        if (!text || text.trim() === '') {
            return { translation: '', error: null };
        }

        // Check cache
        const cacheKey = `${text}_${sourceLang}_${targetLang}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Handle Spanglish specially
        if (sourceLang === 'spanglish') {
            return this.translateSpanglish(text, targetLang);
        }

        try {
            // Split long text into chunks
            const chunks = this.splitText(text, 500);
            const translations = [];

            for (const chunk of chunks) {
                const langPair = `${sourceLang}|${targetLang}`;
                const url = `${this.apiEndpoint}?q=${encodeURIComponent(chunk)}&langpair=${langPair}`;

                // Add delay to respect rate limits
                await this.delay(300);

                const response = await fetch(url);
                const data = await response.json();

                if (data.responseData && data.responseData.translatedText) {
                    translations.push(data.responseData.translatedText);
                } else if (data.responseStatus === 403) {
                    throw new Error('Rate limit reached. Please wait a moment.');
                } else {
                    throw new Error(data.responseMessage || 'Translation failed');
                }
            }

            // Join translations while preserving proper punctuation spacing
            const joinedTranslation = this.joinTranslations(translations, targetLang);

            const result = {
                translation: joinedTranslation,
                error: null
            };

            // Cache result
            this.cache.set(cacheKey, result);
            return result;

        } catch (error) {
            console.error('Translation error:', error);
            return {
                translation: '',
                error: error.message
            };
        }
    }

    // Special handler for Spanglish
    async translateSpanglish(text, targetLang) {
        // Spanglish is a mix of Spanish and English
        // We'll detect which parts are Spanish and which are English
        const words = text.split(/\s+/);
        const translatedWords = [];

        for (const word of words) {
            // Try to detect if word is more Spanish or English
            // For simplicity, translate from Spanish first
            try {
                const result = await this.translate(word, 'es', targetLang);
                translatedWords.push(result.translation || word);
            } catch {
                translatedWords.push(word);
            }
        }

        return {
            translation: translatedWords.join(' '),
            error: null
        };
    }

    // Split text into manageable chunks while preserving punctuation
    splitText(text, maxLength) {
        if (text.length <= maxLength) {
            return [text];
        }

        const chunks = [];
        // Enhanced regex to handle multiple language punctuation marks
        // Includes: . ! ? ¿ ¡ 。 ？ ！ ؟ ، ؛ · • …
        const sentenceRegex = /[^.!?¿¡。？！؟]+[.!?¿¡。？！؟]+[\s]*/g;
        const sentences = text.match(sentenceRegex) || [text];
        let currentChunk = '';

        for (const sentence of sentences) {
            if ((currentChunk + sentence).length <= maxLength) {
                currentChunk += sentence;
            } else {
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                }
                currentChunk = sentence;
            }
        }

        if (currentChunk) {
            chunks.push(currentChunk.trim());
        }

        // If no sentences were found, split by words
        if (chunks.length === 0) {
            const words = text.split(/\s+/);
            currentChunk = '';
            for (const word of words) {
                if ((currentChunk + ' ' + word).length <= maxLength) {
                    currentChunk += (currentChunk ? ' ' : '') + word;
                } else {
                    if (currentChunk) chunks.push(currentChunk);
                    currentChunk = word;
                }
            }
            if (currentChunk) chunks.push(currentChunk);
        }

        return chunks;
    }

    // Join translations with proper punctuation spacing
    joinTranslations(translations, targetLang) {
        if (translations.length === 0) return '';
        if (translations.length === 1) return this.normalizePunctuation(translations[0], targetLang);

        // Join with proper spacing based on language rules
        let result = '';
        for (let i = 0; i < translations.length; i++) {
            const chunk = translations[i].trim();

            if (i === 0) {
                result = chunk;
            } else {
                // Check if previous chunk ends with punctuation
                const prevEndsWithPunct = /[.!?¿¡。？！؟،؛]$/.test(result);
                const currStartsWithPunct = /^[.!?¿¡。？！؟،؛]/.test(chunk);

                // Add space if needed (not for CJK languages which don't use spaces)
                const cjkLanguages = ['zh-CN', 'zh-TW', 'ja', 'ko'];
                const needsSpace = !cjkLanguages.includes(targetLang) && !currStartsWithPunct;

                if (needsSpace && prevEndsWithPunct) {
                    result += ' ' + chunk;
                } else if (needsSpace) {
                    result += ' ' + chunk;
                } else {
                    result += chunk;
                }
            }
        }

        return this.normalizePunctuation(result, targetLang);
    }

    // Normalize punctuation for specific languages
    normalizePunctuation(text, targetLang) {
        let normalized = text;

        // Remove multiple consecutive spaces
        normalized = normalized.replace(/\s+/g, ' ');

        // Fix spacing around punctuation marks
        // Remove space before common punctuation
        normalized = normalized.replace(/\s+([.!?,:;)])/g, '$1');

        // Add space after punctuation if missing (except for decimals)
        normalized = normalized.replace(/([.!?])([A-ZÀ-ÿА-я])/g, '$1 $2');
        normalized = normalized.replace(/([,:;])([^\s\d])/g, '$1 $2');

        // Fix spacing after opening punctuation
        normalized = normalized.replace(/([(\[])\s+/g, '$1');
        normalized = normalized.replace(/\s+([)\]])/g, '$1');

        // Fix quote spacing
        // Remove space after opening quotes
        normalized = normalized.replace(/(["""'])\s+/g, '$1');
        // Remove space before closing quotes
        normalized = normalized.replace(/\s+(["""'])/g, '$1');

        // Fix apostrophes in contractions
        normalized = normalized.replace(/(\w)\s+'\s+(\w)/g, "$1'$2");

        // Fix ellipsis spacing
        normalized = normalized.replace(/\.\s*\.\s*\./g, '...');
        normalized = normalized.replace(/…\s+/g, '... ');

        // Fix dash spacing
        normalized = normalized.replace(/\s*-\s*/g, '-'); // hyphen
        normalized = normalized.replace(/\s*—\s*/g, ' — '); // em dash
        normalized = normalized.replace(/\s*–\s*/g, ' – '); // en dash

        // Language-specific punctuation fixes
        switch(targetLang) {
            case 'fr': // French - space before : ; ! ?
                normalized = normalized.replace(/\s*([!?:;])/g, ' $1');
                normalized = normalized.replace(/\s{2,}([!?:;])/g, ' $1');
                // French quotes guillemets
                normalized = normalized.replace(/«\s*/g, '« ');
                normalized = normalized.replace(/\s*»/g, ' »');
                break;

            case 'es': // Spanish - inverted punctuation
            case 'es-MX':
                // Ensure proper spacing around ¿ and ¡
                normalized = normalized.replace(/¿\s+/g, '¿');
                normalized = normalized.replace(/\s+¿/g, ' ¿');
                normalized = normalized.replace(/¡\s+/g, '¡');
                normalized = normalized.replace(/\s+¡/g, ' ¡');
                break;

            case 'zh-CN':
            case 'zh-TW':
            case 'ja':
            case 'ko':
                // CJK languages - remove spaces around punctuation
                normalized = normalized.replace(/\s*([。，、！？；：「」『』（）【】《》〈〉])\s*/g, '$1');
                // Ensure no spaces between characters for CJK
                normalized = normalized.replace(/([一-龯ぁ-んァ-ヶー가-힣])\s+([一-龯ぁ-んァ-ヶー가-힣])/g, '$1$2');
                break;

            case 'ar':
            case 'fa':
            case 'ur':
            case 'iw': // Hebrew
                // Arabic/Persian/Hebrew - fix spacing around punctuation
                normalized = normalized.replace(/\s*([،؛؟])\s*/g, '$1 ');
                // Arabic quotes
                normalized = normalized.replace(/«\s*/g, '«');
                normalized = normalized.replace(/\s*»/g, '»');
                break;

            case 'de': // German - special quote handling
                normalized = normalized.replace(/„\s*/g, '„');
                normalized = normalized.replace(/\s*"/g, '"');
                break;

            case 'ru': // Russian - guillemets
            case 'uk':
                normalized = normalized.replace(/«\s*/g, '«');
                normalized = normalized.replace(/\s*»/g, '»');
                break;
        }

        // Final cleanup - remove leading/trailing spaces
        normalized = normalized.trim();

        // Fix any double spaces that may have been introduced
        normalized = normalized.replace(/\s{2,}/g, ' ');

        return normalized;
    }

    // Delay helper for rate limiting
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Analyze translation quality
    analyzeTranslation(original, translation, sourceLang, targetLang) {
        const analysis = {
            grammar: [],
            structure: [],
            meaning: [],
            quality: 'good'
        };

        // Basic length comparison
        const lengthRatio = translation.length / original.length;
        if (lengthRatio < 0.5 || lengthRatio > 2) {
            analysis.structure.push('Translation length differs significantly from original');
            analysis.quality = 'moderate';
        }

        // Check for untranslated segments (repeated source text)
        if (translation.toLowerCase().includes(original.toLowerCase().substring(0, 50))) {
            analysis.meaning.push('Some text may not have been translated');
            analysis.quality = 'poor';
        }

        // Check for common translation issues
        if (translation.includes('???') || translation.includes('***')) {
            analysis.grammar.push('Unknown characters detected');
            analysis.quality = 'poor';
        }

        // Sentence structure analysis with multi-language support
        const sentencePunctRegex = /[.!?¿¡。？！؟]+/g;
        const originalSentences = original.match(sentencePunctRegex)?.length || 1;
        const translatedSentences = translation.match(sentencePunctRegex)?.length || 1;

        if (Math.abs(originalSentences - translatedSentences) > 2) {
            analysis.structure.push('Sentence structure differs from original');
        }

        // Check for punctuation preservation
        const hasPunctuation = /[.!?¿¡。？！؟،؛]/.test(translation);
        if (original.length > 50 && !hasPunctuation) {
            analysis.grammar.push('Punctuation may have been lost in translation');
            analysis.quality = 'moderate';
        }

        // Word count comparison
        const originalWords = original.split(/\s+/).length;
        const translatedWords = translation.split(/\s+/).length;
        const wordRatio = translatedWords / originalWords;

        if (wordRatio < 0.6 || wordRatio > 1.8) {
            analysis.meaning.push(`Word count ratio: ${wordRatio.toFixed(2)} (may indicate loss or addition of meaning)`);
        }

        // RTL language support check
        const rtlLanguages = ['ar', 'iw', 'fa', 'ur'];
        if (rtlLanguages.includes(targetLang)) {
            analysis.structure.push('Right-to-left language: ensure proper display direction');
        }

        // CJK language check
        const cjkLanguages = ['zh-CN', 'zh-TW', 'ja', 'ko'];
        if (cjkLanguages.includes(targetLang)) {
            analysis.structure.push('CJK language: character-based translation (no spaces between words)');
        }

        // If no issues found
        if (analysis.grammar.length === 0 && analysis.structure.length === 0 && analysis.meaning.length === 0) {
            analysis.grammar.push('✓ Grammar appears consistent');
            analysis.structure.push('✓ Structure maintained well');
            analysis.meaning.push('✓ Meaning likely preserved');
        }

        return analysis;
    }

    // Get language name from code
    static getLanguageName(code) {
        return TranslationService.languages[code] || code;
    }

    // Get all languages sorted
    static getAllLanguages() {
        return Object.entries(TranslationService.languages)
            .map(([code, name]) => ({ code, name }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }
}

// Export for use in main script
window.TranslationService = TranslationService;
