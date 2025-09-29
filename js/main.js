// main.js - Archivo principal de la aplicación

// Variables globales
let cameraManager;
let currentMode = 'signsToText';
let signRecognizer;

// Elementos del DOM
const btnSignsToText = document.getElementById('btnSignsToText');
const btnTextToSigns = document.getElementById('btnTextToSigns');
const btnStartCamera = document.getElementById('btnStartCamera');
const btnStopCamera = document.getElementById('btnStopCamera');
const btnVoiceInput = document.getElementById('btnVoiceInput');
const btnTranslate = document.getElementById('btnTranslate');
const btnPlayVoice = document.getElementById('btnPlayVoice');
const modelSelect = document.getElementById('model-select');

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
        showMessage('Función de voz en desarrollo...', 'info');
    });

    // Botón traducir
    btnTranslate.addEventListener('click', () => {
        const text = textInput.value.trim();
        
        if (!text) {
            showMessage('Por favor, ingresa un texto', 'warning');
            return;
        }

        showMessage('Traduciendo...', 'info');
    });

    // Botón reproducir voz
    btnPlayVoice.addEventListener('click', () => {
        showMessage('Reproduciendo voz...', 'info');
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

    if (cameraManager.isCameraActive()) {
        cameraManager.stopCamera();
    }
    btnStartCamera.disabled = false;
    btnStopCamera.disabled = true;

    if (mode === 'signsToText') {
        btnSignsToText.classList.add('active');
        btnTextToSigns.classList.remove('active');
        
        cameraSection.style.display = 'block';
        inputSection.style.display = 'none';
        
        textResult.querySelector('p').textContent = 'Aquí aparecerá el texto traducido...';
        textResult.style.display = 'block';
        signResult.style.display = 'none';
        btnPlayVoice.style.display = 'none';

    } else if (mode === 'textToSigns') {
        btnTextToSigns.classList.add('active');
        btnSignsToText.classList.remove('active');
        
        cameraSection.style.display = 'none';
        inputSection.style.display = 'block';
        
        textInput.value = '';
        textResult.style.display = 'none';
        signResult.style.display = 'block';
    }

    console.log(`Modo: ${mode}`);
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