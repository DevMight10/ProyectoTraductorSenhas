// js/textToSpeech.js

class TextToSignTranslator {
    constructor() {
        this.signDatabase = {
            // Mapeo de letras a imágenes
            'a': 'assets/images/abecedario/a.png',
            'b': 'assets/images/abecedario/b.png',
            'c': 'assets/images/abecedario/c.png',
            'd': 'assets/images/abecedario/d.png',
            'e': 'assets/images/abecedario/e.png',
            'f': 'assets/images/abecedario/f.png',
            'g': 'assets/images/abecedario/g.png',
            'h': 'assets/images/abecedario/h.png',
            'i': 'assets/images/abecedario/i.png',
            'j': 'assets/images/abecedario/j.png',
            'k': 'assets/images/abecedario/k.png',
            'l': 'assets/images/abecedario/l.png',
            'm': 'assets/images/abecedario/m.png',
            'n': 'assets/images/abecedario/n.png',
            'o': 'assets/images/abecedario/o.png',
            'p': 'assets/images/abecedario/p.png',
            'q': 'assets/images/abecedario/q.png',
            'r': 'assets/images/abecedario/r.png',
            's': 'assets/images/abecedario/s.png',
            't': 'assets/images/abecedario/t.png',
            'u': 'assets/images/abecedario/u.png',
            'v': 'assets/images/abecedario/v.png',
            'w': 'assets/images/abecedario/w.png',
            'x': 'assets/images/abecedario/x.png',
            'y': 'assets/images/abecedario/y.png',
            'z': 'assets/images/abecedario/z.png',
            // Mapeo de números
            '0': 'assets/images/numeros/0.png',
            '1': 'assets/images/numeros/1.png',
            '2': 'assets/images/numeros/2.png',
            '3': 'assets/images/numeros/3.png',
            '4': 'assets/images/numeros/4.png',
            '5': 'assets/images/numeros/5.png',
            '6': 'assets/images/numeros/6.png',
            '7': 'assets/images/numeros/7.png',
            '8': 'assets/images/numeros/8.png',
            '9': 'assets/images/numeros/9.png',
            '10': 'assets/images/numeros/10.png'
        };
    }

    async translateText(text) {
        if (!text || text.trim() === '') {
            showMessage('Por favor escribe algo para traducir', 'warning');
            return;
        }

        // Limpiar y convertir a minúsculas
        const cleanText = text.toLowerCase().trim();
        
        // Obtener las señas correspondientes
        const signs = this.getSignsForText(cleanText);

        if (signs.length === 0) {
            showMessage('No se encontraron señas para el texto ingresado', 'warning');
            return;
        }

        // Mostrar las señas
        this.displaySigns(signs);
        showMessage(`Se encontraron ${signs.length} señas`, 'success');
    }

    getSignsForText(text) {
        const signs = [];
        
        for (let char of text) {
            // Ignorar espacios
            if (char === ' ') continue;
            
            // Buscar si existe la seña para este carácter
            if (this.signDatabase[char]) {
                signs.push({
                    char: char.toUpperCase(),
                    image: this.signDatabase[char]
                });
            }
        }
        
        return signs;
    }

    displaySigns(signs) {
        const resultContainer = document.querySelector('.result-container');
        
        // Limpiar contenido anterior
        resultContainer.innerHTML = '';
        
        // Crear contenedor para las señas
        const signsContainer = document.createElement('div');
        signsContainer.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            justify-content: center;
            align-items: center;
            padding: 1rem;
        `;
        
        // Agregar cada seña
        signs.forEach(sign => {
            const signCard = document.createElement('div');
            signCard.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                background: white;
                border-radius: 8px;
                padding: 1rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                transition: transform 0.2s;
            `;
            
            signCard.onmouseover = () => signCard.style.transform = 'scale(1.05)';
            signCard.onmouseout = () => signCard.style.transform = 'scale(1)';
            
            // Letra o número
            const label = document.createElement('p');
            label.textContent = sign.char;
            label.style.cssText = `
                font-size: 1.5rem;
                font-weight: 600;
                margin: 0 0 0.5rem 0;
                color: #0077b6;
            `;
            
            // Imagen de la seña
            const img = document.createElement('img');
            img.src = sign.image;
            img.alt = `Seña ${sign.char}`;
            img.style.cssText = `
                width: 150px;
                height: 150px;
                object-fit: cover;
                border-radius: 8px;
            `;
            
            // Manejar error de imagen
            img.onerror = () => {
                img.src = 'https://via.placeholder.com/150?text=' + sign.char;
            };
            
            signCard.appendChild(label);
            signCard.appendChild(img);
            signsContainer.appendChild(signCard);
        });
        
        resultContainer.appendChild(signsContainer);
    }

    speakText(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        } else {
            showMessage('Tu navegador no soporta síntesis de voz', 'error');
        }
    }
}

// Exportar para uso global
window.TextToSignTranslator = TextToSignTranslator;