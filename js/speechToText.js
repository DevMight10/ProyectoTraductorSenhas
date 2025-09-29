class SpeechToText {
    constructor(onResult, onEnd, onError) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            throw new Error("Speech Recognition API not supported in this browser.");
        }

        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'es-ES'; // Set language to Spanish
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;

        this.isRecognizing = false;

        this.recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim();
            if (onResult) {
                onResult(transcript);
            }
        };

        this.recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            if (onError) {
                onError(event); // Pass the whole event
            }
        };

        this.recognition.onend = () => {
            this.isRecognizing = false;
            if (onEnd) {
                onEnd();
            }
        };
    }

    start() {
        if (!this.recognition || this.isRecognizing) {
            return;
        }
        try {
            this.recognition.start();
            this.isRecognizing = true;
        } catch (error) {
            console.error("Error starting recognition:", error);
        }
    }

    stop() {
        if (!this.recognition || !this.isRecognizing) {
            return;
        }
        this.recognition.stop();
        this.isRecognizing = false;
    }
}