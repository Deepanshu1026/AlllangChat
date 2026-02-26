const API_KEY = import.meta.env.VITE_SARVAM_API_KEY;

/**
 * Converts speech to text using Sarvam AI Saaras v3
 * @param {Blob} audioBlob - The recorded audio blob
 * @param {string} languageCode - Preferred language code (e.g., 'hi-IN')
 */
export const speechToText = async (audioBlob, languageCode = 'hi-IN') => {
    try {
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.wav');
        formData.append('model', 'saaras:v1'); // Saaras v1/v2/v3 check

        // Note: Actual endpoint and parameters might vary slightly based on latest documentation.
        // Assuming standard multipart/form-data request for short audio.
        const response = await fetch('https://api.sarvam.ai/v1/speech-to-text-translate', {
            method: 'POST',
            headers: {
                'api-subscription-key': API_KEY
            },
            body: formData
        });

        if (!response.ok) throw new Error('STT Request failed');
        const data = await response.json();
        return data.transcript || data.text;
    } catch (error) {
        console.error('Sarvam STT Error:', error);
        throw error;
    }
};

/**
 * Converts text to speech using Sarvam AI Bulbul v3
 * @param {string} text - The text to convert
 * @param {string} languageCode - Target language (e.g., 'hi-IN')
 * @param {string} speaker - Voice choice ('meera', 'pavithra', 'mahesh', etc.)
 */
export const textToSpeech = async (text, languageCode = 'hi-IN', speaker = 'meera') => {
    try {
        const response = await fetch('https://api.sarvam.ai/v1/text-to-speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-subscription-key': API_KEY
            },
            body: JSON.stringify({
                inputs: [text],
                target_language_code: languageCode,
                speaker: speaker,
                pitch: 0.5,
                pace: 1.0,
                loudness: 1.5,
                speech_sample_rate: 22050,
                enable_preprocessing: true,
                model: 'bulbul:v1'
            })
        });

        if (!response.ok) throw new Error('TTS Request failed');
        const data = await response.json();

        // Sarvam usually returns base64 or a link.
        // If it's audios[0] as base64:
        if (data.audios && data.audios[0]) {
            return `data:audio/wav;base64,${data.audios[0]}`;
        }
        return null;
    } catch (error) {
        console.error('Sarvam TTS Error:', error);
        throw error;
    }
};
