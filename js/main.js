// main.js - Archivo principal de la aplicación

// Variables globales
let cameraManager;
let currentMode = 'signsToText';
let signRecognizer;
let textToSignTranslator;
let speechRecognizer;

// Elementos del DOM
const btnSignsToText = document.getElementById('btnSignsToText');
const btnTextToSigns = document.getElementById('btnTextToSigns');
const btnStartCamera = document.getElementById('btnStartCamera');
const btnStopCamera = document.getElementById('btnStopCamera');
const btnVoiceInput = document.getElementById('btnVoiceInput');
const btnTranslate = document.getElementById('btnTranslate');
const btnPlayVoice = document.getElementById('btnPlayVoice');
const modelSelect = document.getElementById('model-select');

const signsToTextPanel = document.getElementById('signsToTextPanel');
const textToSignsPanel = document.getElementById('textToSignsPanel');
const cameraSection = document.getElementById('cameraSection');
const inputSection = document.getElementById('inputSection');
const textResult = document.getElementById('textResult');
const signResult = document.getElementById('signResult');
const textInput = document.getElementById('textInput');

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Aplicación iniciada');
    
    // Verificar soporte de cámara
    if (!CameraManager.isSupported()) {
        alert('Tu navegador no soporta acceso a la cámara. Por favor, usa un navegador moderno.');
        return;
    }

    // Inicializar gestores
    cameraManager = new CameraManager();
    signRecognizer = new SignRecognizer();
    textToSignTranslator = new TextToSignTranslator();

    // Inicializar Speech Recognizer
    const handleVoiceResult = (transcript) => {
        textInput.value = transcript;
        showMessage('Palabra registrada. Ahora puedes traducir.', 'success');
    };

    const handleVoiceEnd = () => {
        btnVoiceInput.disabled = false;
        btnVoiceInput.querySelector('.icon').textContent = '🎤';
    };

    const handleVoiceError = (errorEvent) => {
        const errorType = errorEvent.error || 'unknown';
        let errorMessage = `Error en el reconocimiento: ${errorType}`;
        let errorTypeClass = 'error';

        if (errorType === 'no-speech') {
            errorMessage = 'No se detectó voz. Inténtalo de nuevo.';
            errorTypeClass = 'warning';
        } else if (errorType === 'network') {
            errorMessage = 'Error de red. Por favor, verifica tu conexión a internet e inténtalo de nuevo.';
        } else if (errorType === 'not-allowed' || errorType === 'service-not-allowed') {
            errorMessage = 'Acceso al micrófono denegado. Habilita el permiso en la configuración del navegador.';
        } else if (errorType === 'audio-capture') {
            errorMessage = 'No se pudo acceder al micrófono. Asegúrate de que no esté siendo usado por otra aplicación.';
        }
        
        showMessage(errorMessage, errorTypeClass);
        handleVoiceEnd(); // Reset button state on error
    };

    try {
        speechRecognizer = new SpeechToText(handleVoiceResult, handleVoiceEnd, handleVoiceError);
    } catch (error) {
        console.error(error.message);
        showMessage(error.message, 'error');
        if (btnVoiceInput) {
            btnVoiceInput.disabled = true;
            btnVoiceInput.title = 'Reconocimiento de voz no soportado';
        }
    }

    // Cargar modelo por defecto
    await signRecognizer.initialize('abecedario');
    showMessage('Modelo cargado: Abecedario', 'success');

    // Iniciar reconocimiento continuo
    startContinuousRecognition();

    // Configurar event listeners
    setupEventListeners();

    // Mostrar sección inicial
    switchMode('signsToText');
});

// Event listener para cambio de modelo
function setupEventListeners() {
    // Selector de modelo
    modelSelect.addEventListener('change', async (e) => {
        const newModel = e.target.value;
        showMessage(`Cambiando a: ${signRecognizer.modelConfig[newModel].name}...`, 'info');
        
        const success = await signRecognizer.switchModel(newModel);
        
        if (success) {
            showMessage(`Modelo cargado: ${signRecognizer.getCurrentModelName()}`, 'success');
        } else {
            showMessage('Error al cambiar modelo', 'error');
        }
    });

    // Botones de modo
    btnSignsToText.addEventListener('click', () => {
        switchMode('signsToText');
    });

    btnTextToSigns.addEventListener('click', () => {
        switchMode('textToSigns');
    });

    // Botones de cámara
    btnStartCamera.addEventListener('click', async () => {
        btnStartCamera.disabled = true;
        btnStartCamera.textContent = 'Iniciando...';

        const cameraSuccess = await cameraManager.startCamera();
        
        if (cameraSuccess) {
            btnStartCamera.textContent = 'Iniciar Cámara';
            btnStopCamera.disabled = false;
            showMessage('Cámara iniciada correctamente', 'success');
        } else {
            btnStartCamera.disabled = false;
            btnStartCamera.textContent = 'Iniciar Cámara';
        }
    });

    btnStopCamera.addEventListener('click', () => {
        cameraManager.stopCamera();
        btnStartCamera.disabled = false;
        btnStopCamera.disabled = true;
        showMessage('Cámara detenida', 'info');
    });

    // Botón de voz
    btnVoiceInput.addEventListener('click', () => {
        if (speechRecognizer && !speechRecognizer.isRecognizing) {
            showMessage('Escuchando...', 'info');
            btnVoiceInput.disabled = true;
            btnVoiceInput.querySelector('.icon').textContent = '...';
            speechRecognizer.start();
        } else if (!speechRecognizer) {
            showMessage('El reconocimiento de voz no está disponible.', 'error');
        }
    });

    // ============================================
    // BOTÓN TRADUCIR - TEXTO → SEÑAS
    // ============================================
    btnTranslate.addEventListener('click', async () => {
        const text = textInput.value.trim();
        
        if (!text) {
            showMessage('Por favor, ingresa un texto', 'warning');
            return;
        }

        // Deshabilitar botón mientras traduce
        btnTranslate.disabled = true;
        btnTranslate.textContent = 'Traduciendo...';
        
        try {
            await textToSignTranslator.translateText(text);
        } catch (error) {
            console.error('Error al traducir:', error);
            showMessage('Error al traducir el texto', 'error');
        } finally {
            // Rehabilitar botón
            btnTranslate.disabled = false;
            btnTranslate.textContent = 'Traducir';
        }
    });

    // Traducir al presionar Enter
    textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            btnTranslate.click();
        }
    });

    // Botón reproducir voz
    btnPlayVoice.addEventListener('click', () => {
        const text = textResult.querySelector('p').textContent;
        if (text && text !== 'Aquí aparecerá el texto traducido...') {
            textToSignTranslator.speakText(text);
            showMessage('Reproduciendo voz...', 'info');
        } else {
            showMessage('No hay texto para reproducir', 'warning');
        }
    });
}


// Reconocimiento continuo
function startContinuousRecognition() {
    setInterval(async () => {
        if (cameraManager.isCameraActive() && signRecognizer.isReady()) {
            const prediction = await signRecognizer.recognizeSign();
            if (prediction) {
                console.log(`Seña detectada: ${prediction.label} (${(prediction.confidence * 100).toFixed(1)}%)`);
                updateTextResult(prediction.label);
            }
        }
    }, 500);
}

// Cambiar modo
function switchMode(mode) {
    currentMode = mode;

    // Detener la cámara si está activa al cambiar de modo
    if (cameraManager.isCameraActive()) {
        cameraManager.stopCamera();
        btnStartCamera.disabled = false;
        btnStopCamera.disabled = true;
    }

    if (mode === 'signsToText') {
        // Actualizar botones de modo
        btnSignsToText.classList.add('active');
        btnTextToSigns.classList.remove('active');
        
        // Mostrar y ocultar paneles
        signsToTextPanel.classList.remove('hidden');
        textToSignsPanel.classList.add('hidden');
        
        // Resetear estado de la UI de resultados
        textResult.style.display = 'block';
        signResult.style.display = 'none';
        btnPlayVoice.style.display = 'none';
        textResult.querySelector('p').textContent = 'Aquí aparecerá el texto traducido...';

    } else if (mode === 'textToSigns') {
        // Actualizar botones de modo
        btnTextToSigns.classList.add('active');
        btnSignsToText.classList.remove('active');
        
        // Mostrar y ocultar paneles
        textToSignsPanel.classList.remove('hidden');
        signsToTextPanel.classList.add('hidden');
        
        // Resetear estado de la UI de resultados
        textInput.value = '';
        textResult.style.display = 'none';
        signResult.style.display = 'block';
        
        // Limpiar resultado anterior y mostrar placeholder
        const signImage = document.getElementById('signImage');
        if (signImage) signImage.style.display = 'none';
        // Aquí puedes establecer una imagen o video de placeholder si lo deseas
    }

    console.log(`Modo cambiado a: ${mode}`);
}

// Mostrar mensajes
function showMessage(message, type = 'info') {
    console.log(`${getMessageIcon(type)} ${message}`);
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${getMessageColor(type)};
        color: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function getMessageColor(type) {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#0077b6'
    };
    return colors[type] || colors.info;
}

function getMessageIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || icons.info;
}

function updateTextResult(text) {
    const resultText = textResult.querySelector('p');
    resultText.textContent = text;
    btnPlayVoice.style.display = 'flex';
}

function updateSignResult(mediaUrl, type = 'video') {
    const signVideo = document.getElementById('signVideo');
    const signImage = document.getElementById('signImage');

    if (type === 'video') {
        signVideo.src = mediaUrl;
        signVideo.style.display = 'block';
        signImage.style.display = 'none';
    } else if (type === 'image') {
        signImage.src = mediaUrl;
        signImage.style.display = 'block';
        signVideo.style.display = 'none';
    }
}

// Animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

window.updateTextResult = updateTextResult;
window.updateSignResult = updateSignResult;
window.showMessage = showMessage;