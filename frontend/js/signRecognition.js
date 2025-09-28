// signRecognition.js - VERSIÓN MEJORADA

class SignRecognizer {
    constructor() {
        this.model = null;
        this.isModelLoaded = false;
        this.signLabels = this.getSignLabels();
        this.lastPrediction = null;
        this.predictionThreshold = 0.75; // Aumentado a 75%
        this.consecutiveDetections = 0;
        this.requiredConsecutive = 5; // Requiere 5 detecciones seguidas
        this.lastDetectedSign = null;
    }

    getSignLabels() {
        return [
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
            'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
            'U', 'V', 'W', 'X', 'Y', 'Z',
            'Hola', 'Gracias', 'Por favor', 'Adiós'
        ];
    }

    async initialize() {
        try {
            console.log('🤖 Inicializando reconocedor de señas...');
            this.isModelLoaded = true;
            console.log('✅ Reconocedor inicializado');
            return true;
        } catch (error) {
            console.error('❌ Error al inicializar reconocedor:', error);
            return false;
        }
    }

    async recognizeSign(landmarks) {
        if (!this.isModelLoaded || !landmarks || landmarks.length === 0) {
            return null;
        }

        try {
            const normalizedData = this.normalizeLandmarks(landmarks[0]);
            const prediction = this.simulateRecognition(normalizedData);

            if (prediction) {
                // Verificar detecciones consecutivas
                if (this.lastDetectedSign === prediction.label) {
                    this.consecutiveDetections++;
                } else {
                    this.consecutiveDetections = 1;
                    this.lastDetectedSign = prediction.label;
                }

                // Solo retornar si se ha detectado varias veces seguidas
                if (this.consecutiveDetections >= this.requiredConsecutive) {
                    this.lastPrediction = prediction;
                    return prediction;
                }
            } else {
                this.consecutiveDetections = 0;
                this.lastDetectedSign = null;
            }

            return null;

        } catch (error) {
            console.error('❌ Error al reconocer seña:', error);
            return null;
        }
    }

    normalizeLandmarks(landmarks) {
        const normalized = [];
        const wrist = landmarks[0];

        for (let i = 0; i < landmarks.length; i++) {
            const point = landmarks[i];
            normalized.push(
                point.x - wrist.x,
                point.y - wrist.y,
                point.z - wrist.z
            );
        }

        return normalized;
    }

    simulateRecognition(data) {
        // Puntas de los dedos (índices en el array normalizado)
        const thumbTip = { x: data[12], y: data[13], z: data[14] };
        const indexTip = { x: data[24], y: data[25], z: data[26] };
        const middleTip = { x: data[36], y: data[37], z: data[38] };
        const ringTip = { x: data[48], y: data[49], z: data[50] };
        const pinkyTip = { x: data[60], y: data[61], z: data[62] };

        // Bases de los dedos
        const indexBase = { y: data[16] };
        const middleBase = { y: data[28] };
        const ringBase = { y: data[40] };
        const pinkyBase = { y: data[52] };

        // PATRÓN 1: Todos los dedos arriba (mano abierta) = "Hola"
        const allFingersUp = 
            indexTip.y < indexBase.y - 0.15 &&
            middleTip.y < middleBase.y - 0.15 &&
            ringTip.y < ringBase.y - 0.15 &&
            pinkyTip.y < pinkyBase.y - 0.15;

        if (allFingersUp) {
            return { label: 'Hola', confidence: 0.85 };
        }

        // PATRÓN 2: Solo índice arriba = "1"
        const onlyIndexUp = 
            indexTip.y < indexBase.y - 0.15 &&
            middleTip.y > middleBase.y - 0.05 &&
            ringTip.y > ringBase.y - 0.05 &&
            pinkyTip.y > pinkyBase.y - 0.05;

        if (onlyIndexUp) {
            return { label: '1', confidence: 0.80 };
        }

        // PATRÓN 3: Índice y medio arriba = "2" o "V"
        const twoFingersUp = 
            indexTip.y < indexBase.y - 0.15 &&
            middleTip.y < middleBase.y - 0.15 &&
            ringTip.y > ringBase.y - 0.05 &&
            pinkyTip.y > pinkyBase.y - 0.05;

        if (twoFingersUp) {
            return { label: 'V', confidence: 0.80 };
        }

        // PATRÓN 4: Puño cerrado = "A"
        const allFingersDown = 
            indexTip.y > indexBase.y - 0.05 &&
            middleTip.y > middleBase.y - 0.05 &&
            ringTip.y > ringBase.y - 0.05 &&
            pinkyTip.y > pinkyBase.y - 0.05;

        if (allFingersDown) {
            return { label: 'A', confidence: 0.78 };
        }

        // PATRÓN 5: Pulgar arriba = "Like" o "B"
        const thumbUp = thumbTip.y < data[10] - 0.2;
        const otherDown = indexTip.y > indexBase.y - 0.05;

        if (thumbUp && otherDown) {
            return { label: 'B', confidence: 0.75 };
        }

        return null;
    }

    getLastPrediction() {
        return this.lastPrediction;
    }

    isReady() {
        return this.isModelLoaded;
    }

    setThreshold(threshold) {
        this.predictionThreshold = threshold;
    }

    clearPrediction() {
        this.lastPrediction = null;
        this.consecutiveDetections = 0;
        this.lastDetectedSign = null;
    }
}

window.SignRecognizer = SignRecognizer;