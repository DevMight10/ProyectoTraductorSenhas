// signRecognition.js - ACTUALIZADO PARA TEACHABLE MACHINE

class SignRecognizer {
    constructor() {
        this.model = null;
        this.isModelLoaded = false;
        this.signLabels = ['A', 'B', 'C', 'D', 'E', 'F']; // Alfabeto LSB primeras 6 letras
        this.lastPrediction = null;
        this.predictionThreshold = 0.85; // 80% de confianza
        this.consecutiveDetections = 0;
        this.requiredConsecutive = 3; // Requiere 3 detecciones seguidas
        this.lastDetectedSign = null;
        this.imageSize = 224; // Tamaño de imagen que espera el modelo
    }

    async initialize() {
        try {
            console.log('🤖 Cargando modelo desde Teachable Machine...');
            
            // Cargar el modelo desde la carpeta models/
            const modelURL = './models/model.json';
            this.model = await tf.loadLayersModel(modelURL);
            
            console.log('✅ Modelo cargado exitosamente');
            console.log('📋 Clases disponibles:', this.signLabels);
            
            this.isModelLoaded = true;
            return true;
            
        } catch (error) {
            console.error('❌ Error al cargar el modelo:', error);
            console.log('⚠️ Usando sistema básico de fallback...');
            this.isModelLoaded = false;
            return false;
        }
    }

    async recognizeSign(landmarks) {
        // Solo usar Teachable Machine, ignorar MediaPipe landmarks
        try {
            let prediction;

            if (this.isModelLoaded) {
                // Usar el modelo de Teachable Machine directamente
                prediction = await this.recognizeWithTeachableMachine();
            } else {
                // Sin sistema básico de fallback
                return null;
            }

            if (prediction) {
                // Verificar detecciones consecutivas para estabilidad
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

    async recognizeWithTeachableMachine() {
        try {
            // Obtener el frame actual del video
            const videoElement = document.getElementById('videoElement');
            if (!videoElement || videoElement.videoWidth === 0) {
                return null;
            }

            // Crear un canvas temporal para procesar la imagen
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = this.imageSize;
            canvas.height = this.imageSize;

            // Dibujar y redimensionar el frame del video
            ctx.drawImage(videoElement, 0, 0, this.imageSize, this.imageSize);

            // Convertir a tensor para TensorFlow
            const imageTensor = tf.browser.fromPixels(canvas)
                .resizeNearestNeighbor([this.imageSize, this.imageSize])
                .toFloat()
                .div(255.0)
                .expandDims(0);

            // Hacer la predicción
            const predictions = await this.model.predict(imageTensor).data();
            imageTensor.dispose(); // Liberar memoria

            // Encontrar la clase con mayor probabilidad
            let maxProbability = 0;
            let predictedClassIndex = 0;

            for (let i = 0; i < predictions.length; i++) {
                if (predictions[i] > maxProbability) {
                    maxProbability = predictions[i];
                    predictedClassIndex = i;
                }
            }

            // Verificar si supera el umbral de confianza
            if (maxProbability >= this.predictionThreshold) {
                return {
                    label: this.signLabels[predictedClassIndex],
                    confidence: maxProbability
                };
            }

            return null;

        } catch (error) {
            console.error('❌ Error en predicción TM:', error);
            return null;
        }
    }

    recognizeWithBasicPatterns(landmarks) {
        // Sistema básico de fallback - solo para emergencias
        const normalized = this.normalizeLandmarks(landmarks);
        
        // Puntas de los dedos
        const indexTip = { x: normalized[24], y: normalized[25], z: normalized[26] };
        const middleTip = { x: normalized[36], y: normalized[37], z: normalized[38] };
        const ringTip = { x: normalized[48], y: normalized[49], z: normalized[50] };
        const pinkyTip = { x: normalized[60], y: normalized[61], z: normalized[62] };

        // Bases de los dedos
        const indexBase = { y: normalized[16] };
        const middleBase = { y: normalized[28] };
        const ringBase = { y: normalized[40] };
        const pinkyBase = { y: normalized[52] };

        // PATRÓN: Mano abierta = "hola"
        const allFingersUp = 
            indexTip.y < indexBase.y - 0.15 &&
            middleTip.y < middleBase.y - 0.15 &&
            ringTip.y < ringBase.y - 0.15 &&
            pinkyTip.y < pinkyBase.y - 0.15;

        if (allFingersUp) {
            return { label: 'hola', confidence: 0.75 };
        }

        return null;
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

    // Método para probar el modelo manualmente
    async testModel() {
        if (!this.isModelLoaded) {
            console.log('⚠️ Modelo no cargado');
            return;
        }

        console.log('🧪 Probando modelo...');
        const prediction = await this.recognizeWithTeachableMachine();
        
        if (prediction) {
            console.log(`✅ Predicción: ${prediction.label} (${(prediction.confidence * 100).toFixed(1)}%)`);
        } else {
            console.log('❌ No se detectó ninguna seña');
        }
    }
}

// Exportar para uso global
window.SignRecognizer = SignRecognizer;