// // handDetection.js - Detección de manos con MediaPipe

// class HandDetector {
//     constructor() {
//         this.hands = null;
//         this.camera = null;
//         this.canvasElement = document.getElementById('canvasElement');
//         this.canvasCtx = this.canvasElement.getContext('2d');
//         this.videoElement = document.getElementById('videoElement');
//         this.isDetecting = false;
//         this.onResultsCallback = null;
//     }

//     // Inicializar MediaPipe Hands
//     async initialize() {
//         try {
//             // Configurar MediaPipe Hands
//             this.hands = new Hands({
//                 locateFile: (file) => {
//                     return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
//                 }
//             });

//             // Configuración del modelo
//             this.hands.setOptions({
//                 maxNumHands: 2,              // Detectar hasta 2 manos
//                 modelComplexity: 1,          // 0=lite, 1=full (más preciso)
//                 minDetectionConfidence: 0.5, // Confianza mínima para detectar
//                 minTrackingConfidence: 0.5   // Confianza mínima para rastrear
//             });

//             // Callback cuando se detecten resultados
//             this.hands.onResults((results) => this.onResults(results));

//             console.log('✅ MediaPipe Hands inicializado');
//             return true;

//         } catch (error) {
//             console.error('❌ Error al inicializar MediaPipe:', error);
//             return false;
//         }
//     }

//     // Iniciar detección
//     async startDetection() {
//         if (!this.hands) {
//             await this.initialize();
//         }

//         try {
//             // Configurar la cámara para MediaPipe
//             this.camera = new Camera(this.videoElement, {
//                 onFrame: async () => {
//                     if (this.isDetecting) {
//                         await this.hands.send({ image: this.videoElement });
//                     }
//                 },
//                 width: 1280,
//                 height: 720
//             });

//             await this.camera.start();
//             this.isDetecting = true;

//             console.log('🖐️ Detección de manos iniciada');
//             return true;

//         } catch (error) {
//             console.error('❌ Error al iniciar detección:', error);
//             return false;
//         }
//     }

//     // Detener detección
//     stopDetection() {
//         this.isDetecting = false;
        
//         if (this.camera) {
//             this.camera.stop();
//             this.camera = null;
//         }

//         // Limpiar el canvas
//         this.clearCanvas();

//         console.log('⏹️ Detección de manos detenida');
//     }

//     // Procesar resultados de MediaPipe
//     onResults(results) {
//         // Limpiar canvas
//         this.canvasCtx.save();
//         this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

//         // Dibujar la imagen del video
//         this.canvasCtx.drawImage(
//             results.image, 
//             0, 0, 
//             this.canvasElement.width, 
//             this.canvasElement.height
//         );

//         // Si hay manos detectadas, dibujarlas
//         if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
//             for (const landmarks of results.multiHandLandmarks) {
//                 // Dibujar puntos de la mano
//                 drawConnectors(this.canvasCtx, landmarks, HAND_CONNECTIONS, {
//                     color: '#00b4d8',
//                     lineWidth: 5
//                 });
                
//                 drawLandmarks(this.canvasCtx, landmarks, {
//                     color: '#0077b6',
//                     lineWidth: 2,
//                     radius: 5
//                 });
//             }

//             // Si hay un callback definido, ejecutarlo con los resultados
//             if (this.onResultsCallback) {
//                 this.onResultsCallback(results);
//             }
//         }

//         this.canvasCtx.restore();
//     }

//     // Limpiar el canvas
//     clearCanvas() {
//         this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
//     }

//     // Registrar callback para cuando se detecten manos
//     setOnResultsCallback(callback) {
//         this.onResultsCallback = callback;
//     }

//     // Obtener landmarks de las manos detectadas
//     getHandLandmarks(results) {
//         if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
//             return results.multiHandLandmarks;
//         }
//         return null;
//     }

//     // Verificar si hay manos detectadas
//     hasHands(results) {
//         return results.multiHandLandmarks && results.multiHandLandmarks.length > 0;
//     }

//     // Obtener información de la mano (izquierda/derecha)
//     getHandedness(results) {
//         if (results.multiHandedness && results.multiHandedness.length > 0) {
//             return results.multiHandedness.map(hand => hand.label); // ['Left', 'Right']
//         }
//         return [];
//     }
// }

// // Exportar para uso global
// window.HandDetector = HandDetector;