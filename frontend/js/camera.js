// camera.js - Manejo de la cámara web

class CameraManager {
    constructor() {
        this.videoElement = document.getElementById('videoElement');
        this.canvasElement = document.getElementById('canvasElement');
        this.stream = null;
        this.isActive = false;
    }

    // Iniciar la cámara
    async startCamera() {
        try {
            // Solicitar acceso a la cámara
            const constraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user' // Cámara frontal
                },
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Asignar el stream al elemento video
            this.videoElement.srcObject = this.stream;
            this.isActive = true;

            console.log('✅ Cámara iniciada correctamente');
            return true;

        } catch (error) {
            console.error('❌ Error al acceder a la cámara:', error);
            this.handleCameraError(error);
            return false;
        }
    }

    // Detener la cámara
    stopCamera() {
        if (this.stream) {
            // Detener todas las pistas del stream
            this.stream.getTracks().forEach(track => {
                track.stop();
            });

            this.videoElement.srcObject = null;
            this.stream = null;
            this.isActive = false;

            console.log('⏹️ Cámara detenida');
            return true;
        }
        return false;
    }

    // Verificar si la cámara está activa
    isCameraActive() {
        return this.isActive;
    }

    // Obtener el elemento de video
    getVideoElement() {
        return this.videoElement;
    }

    // Obtener el canvas
    getCanvasElement() {
        return this.canvasElement;
    }

    // Capturar una imagen del video actual
    captureFrame() {
        if (!this.isActive) {
            console.warn('⚠️ La cámara no está activa');
            return null;
        }

        const canvas = this.canvasElement;
        const video = this.videoElement;
        const ctx = canvas.getContext('2d');

        // Ajustar tamaño del canvas al video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Dibujar el frame actual
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        return canvas;
    }

    // Manejar errores de cámara
    handleCameraError(error) {
        let errorMessage = '';

        switch (error.name) {
            case 'NotAllowedError':
            case 'PermissionDeniedError':
                errorMessage = 'Permiso denegado. Por favor, permite el acceso a la cámara.';
                break;
            case 'NotFoundError':
            case 'DevicesNotFoundError':
                errorMessage = 'No se encontró ninguna cámara en el dispositivo.';
                break;
            case 'NotReadableError':
            case 'TrackStartError':
                errorMessage = 'La cámara ya está en uso por otra aplicación.';
                break;
            case 'OverconstrainedError':
            case 'ConstraintNotSatisfiedError':
                errorMessage = 'La cámara no cumple con los requisitos necesarios.';
                break;
            case 'TypeError':
                errorMessage = 'Error de configuración de la cámara.';
                break;
            default:
                errorMessage = 'Error desconocido al acceder a la cámara.';
        }

        // Mostrar mensaje al usuario
        this.showError(errorMessage);
    }

    // Mostrar mensaje de error en la UI
    showError(message) {
        // Puedes personalizar cómo mostrar el error
        alert(message);
        console.error(message);
    }

    // Verificar si el navegador soporta getUserMedia
    static isSupported() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }
}

// Exportar para uso en otros archivos
window.CameraManager = CameraManager;