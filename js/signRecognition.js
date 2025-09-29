// signRecognition.js - Sistema multi-modelo para Teachable Machine

class SignRecognizer {
    constructor() {
        this.model = null;
        this.metadata = null;
        this.isModelLoaded = false;
        this.currentModelType = 'abecedario';
        this.lastPrediction = null;
        this.predictionThreshold = 0.80; // 80% de confianza
        this.consecutiveDetections = 0;
        this.requiredConsecutive = 3;
        this.lastDetectedSign = null;
        this.imageSize = 224;
        
        // Configuración de modelos
        this.modelConfig = {
            abecedario: {
                url: './models/abecedario/',
                name: 'Abecedario LSB'
            },
            numeros: {
                url: './models/numeros/',
                name: 'Números LSB'
            },
            saludos: {
                url: './models/saludos/',
                name: 'Saludos LSB'
            }
        };
    }

    async initialize(modelType = 'abecedario') {
        return await this.loadModel(modelType);
    }

    async loadModel(modelType) {
        try {
            if (!this.modelConfig[modelType]) {
                console.error('Modelo no válido:', modelType);
                return false;
            }

            console.log(`🤖 Cargando modelo: ${this.modelConfig[modelType].name}...`);
            
            const modelURL = this.modelConfig[modelType].url + 'model.json';
            const metadataURL = this.modelConfig[modelType].url + 'metadata.json';

            // Modelo ASL pre-entrenado público
            // const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/IXas6eqIf/';
            // const modelURL = MODEL_URL + 'model.json';
            // const metadataURL = MODEL_URL + 'metadata.json';

            // Cargar modelo de Teachable Machine
            this.model = await tmImage.load(modelURL, metadataURL);
            
            // Obtener metadata
            const response = await fetch(metadataURL);
            this.metadata = await response.json();
            
            this.isModelLoaded = true;
            this.currentModelType = modelType;
            
            console.log(`✅ Modelo cargado: ${this.modelConfig[modelType].name}`);
            console.log(`📋 Clases: ${this.metadata.labels.join(', ')}`);
            
            return true;
            
        } catch (error) {
            console.error('❌ Error al cargar el modelo:', error);
            this.isModelLoaded = false;
            return false;
        }
    }

    async switchModel(newModelType) {
        if (newModelType === this.currentModelType) {
            console.log('Ya estás usando ese modelo');
            return true;
        }

        console.log(`🔄 Cambiando a modelo: ${newModelType}`);
        this.clearPrediction();
        return await this.loadModel(newModelType);
    }

    async recognizeSign() {
        if (!this.isModelLoaded) {
            return null;
        }

        try {
            const videoElement = document.getElementById('videoElement');
            if (!videoElement || videoElement.videoWidth === 0) {
                return null;
            }

            // Hacer predicción con Teachable Machine
            const predictions = await this.model.predict(videoElement);
            
            // Ordenar por probabilidad
            predictions.sort((a, b) => b.probability - a.probability);
            
            const topPrediction = predictions[0];

            // Verificar umbral de confianza
            if (topPrediction.probability >= this.predictionThreshold) {
                const prediction = {
                    label: topPrediction.className.trim(), // Elimina espacios
                    confidence: topPrediction.probability,
                    modelType: this.currentModelType
                };

                // Verificar detecciones consecutivas
                if (this.lastDetectedSign === prediction.label) {
                    this.consecutiveDetections++;
                } else {
                    this.consecutiveDetections = 1;
                    this.lastDetectedSign = prediction.label;
                }

                // Retornar solo si es estable
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

    getLastPrediction() {
        return this.lastPrediction;
    }

    isReady() {
        return this.isModelLoaded;
    }

    getCurrentModelType() {
        return this.currentModelType;
    }

    getCurrentModelName() {
        return this.modelConfig[this.currentModelType]?.name || 'Desconocido';
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

// Exportar para uso global
window.SignRecognizer = SignRecognizer;