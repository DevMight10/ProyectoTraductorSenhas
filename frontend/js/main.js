// main.js - Archivo principal de la aplicación

// Variables globales
let cameraManager;
let currentMode = 'signsToText'; // 'signsToText' o 'textToSigns'

// Elementos del DOM
const btnSignsToText = document.getElementById('btnSignsToText');
const btnTextToSigns = document.getElementById('btnTextToSigns');
const btnStartCamera = document.getElementById('btnStartCamera');
const btnStopCamera = document.getElementById('btnStopCamera');
const btnVoiceInput = document.getElementById('btnVoiceInput');
const btnTranslate = document.getElementById('btnTranslate');
const btnPlayVoice = document.getElementById('btnPlayVoice');

const cameraSection = document.getElementById('cameraSection');
const inputSection = document.getElementById('inputSection');
const textResult = document.getElementById('textResult');
const signResult = document.getElementById('signResult');
const textInput = document.getElementById('textInput');

// Inicializar la aplicación cuando cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Aplicación iniciada');
    
    // Verificar soporte de cámara
    if (!CameraManager.isSupported()) {
        alert('Tu navegador no soporta acceso a la cámara. Por favor, usa un navegador moderno.');
        return;
    }

    // Inicializar el gestor de cámara
    cameraManager = new CameraManager();

    // Configurar event listeners
    setupEventListeners();

    // Mostrar sección inicial
    switchMode('signsToText');
});

// Configurar todos los event listeners
function setupEventListeners() {
    // Botones de modo de traducción
    btnSignsToText.addEventListener('click', () => {
        switchMode('signsToText');
    });

    btnTextToSigns.addEventListener('click', () => {
        switchMode('textToSigns');
    });

    // Botones de control de cámara
    btnStartCamera.addEventListener('click', async () => {
        const success = await cameraManager.startCamera();
        
        if (success) {
            btnStartCamera.disabled = true;
            btnStopCamera.disabled = false;
            showMessage('Cámara iniciada correctamente', 'success');
        }
    });

    btnStopCamera.addEventListener('click', () => {
        cameraManager.stopCamera();
        btnStartCamera.disabled = false;
        btnStopCamera.disabled = true;
        showMessage('Cámara detenida', 'info');
    });

    // Botón de entrada de voz (implementación pendiente)
    btnVoiceInput.addEventListener('click', () => {
        showMessage('Función de voz en desarrollo...', 'info');
        // Aquí irá la función de speech-to-text
    });

    // Botón de traducir (implementación pendiente)
    btnTranslate.addEventListener('click', () => {
        const text = textInput.value.trim();
        
        if (!text) {
            showMessage('Por favor, ingresa un texto', 'warning');
            return;
        }

        showMessage('Traduciendo...', 'info');
        // Aquí irá la función de traducción texto -> señas
    });

    // Botón de reproducir voz (implementación pendiente)
    btnPlayVoice.addEventListener('click', () => {
        showMessage('Reproduciendo voz...', 'info');
        // Aquí irá la función de text-to-speech
    });
}

// Cambiar entre modos de traducción
function switchMode(mode) {
    currentMode = mode;

    // Actualizar botones activos
    if (mode === 'signsToText') {
        btnSignsToText.classList.add('active');
        btnTextToSigns.classList.remove('active');
        
        // Mostrar sección de cámara
        cameraSection.style.display = 'block';
        inputSection.style.display = 'none';
        
        // Limpiar resultados
        textResult.querySelector('p').textContent = 'Aquí aparecerá el texto traducido...';
        textResult.style.display = 'block';
        signResult.style.display = 'none';

    } else if (mode === 'textToSigns') {
        btnTextToSigns.classList.add('active');
        btnSignsToText.classList.remove('active');
        
        // Mostrar sección de entrada de texto
        cameraSection.style.display = 'none';
        inputSection.style.display = 'block';
        
        // Limpiar resultados
        textInput.value = '';
        textResult.style.display = 'none';
        signResult.style.display = 'block';
    }

    console.log(`📍 Modo cambiado a: ${mode}`);
}

// Mostrar mensajes al usuario
function showMessage(message, type = 'info') {
    // Tipos: 'success', 'error', 'warning', 'info'
    
    console.log(`${getMessageIcon(type)} ${message}`);
    
    // Crear elemento de notificación
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
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Obtener color según tipo de mensaje
function getMessageColor(type) {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#0077b6'
    };
    return colors[type] || colors.info;
}

// Obtener icono según tipo de mensaje
function getMessageIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || icons.info;
}

// Actualizar resultado de texto
function updateTextResult(text) {
    const resultText = textResult.querySelector('p');
    resultText.textContent = text;
    btnPlayVoice.style.display = 'flex';
}

// Actualizar resultado de señas (video o imagen)
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

// Agregar estilos para animaciones
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

// Exportar funciones globales si es necesario
window.updateTextResult = updateTextResult;
window.updateSignResult = updateSignResult;
window.showMessage = showMessage;