class SpeechToTextApp {
    constructor() {
        this.recognition = null;
        this.isRecording = false;
        this.transcript = '';
        this.finalTranscript = '';
        
        this.initElements();
        this.initSpeechRecognition();
        this.initEventListeners();
        this.createFloatingParticles();
    }

    initElements() {
        this.recordBtn = document.getElementById('recordBtn');
        this.recordIcon = document.getElementById('recordIcon');
        this.status = document.getElementById('status');
        this.transcriptBox = document.getElementById('transcriptBox');
        this.copyBtn = document.getElementById('copyBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.waveAnimation = document.getElementById('waveAnimation');
        this.notification = document.getElementById('notification');
    }

    initSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showNotification('Speech recognition not supported in this browser', 'error');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            this.isRecording = true;
            this.updateUI();
            this.waveAnimation.classList.add('active');
        };

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                
                if (event.results[i].isFinal) {
                    this.finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }
            
            this.transcript = this.finalTranscript + interimTranscript;
            this.updateTranscript();
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.showNotification('Recognition error: ' + event.error, 'error');
            this.stopRecording();
        };

        this.recognition.onend = () => {
            this.stopRecording();
        };
    }

    initEventListeners() {
        this.recordBtn.addEventListener('click', () => {
            this.isRecording ? this.stopRecording() : this.startRecording();
        });

        this.copyBtn.addEventListener('click', () => {
            this.copyToClipboard();
        });

        this.clearBtn.addEventListener('click', () => {
            this.clearTranscript();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' && e.ctrlKey) {
                e.preventDefault();
                this.isRecording ? this.stopRecording() : this.startRecording();
            }
        });
    }

    startRecording() {
        if (!this.recognition) {
            this.showNotification('Speech recognition not available', 'error');
            return;
        }

        try {
            this.recognition.start();
            this.showNotification('Recording started', 'success');
        } catch (error) {
            console.error('Error starting recognition:', error);
            this.showNotification('Failed to start recording', 'error');
        }
    }

    stopRecording() {
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
        }
        this.isRecording = false;
        this.updateUI();
        this.waveAnimation.classList.remove('active');
        this.showNotification('Recording stopped', 'info');
    }

    updateUI() {
        if (this.isRecording) {
            this.recordBtn.classList.add('recording');
            this.recordIcon.textContent = '⏹️';
            this.status.textContent = 'Recording... Click to stop';
        } else {
            this.recordBtn.classList.remove('recording');
            this.recordIcon.textContent = '🎤';
            this.status.textContent = 'Click to start recording';
        }
    }

    updateTranscript() {
        if (this.transcript.trim()) {
            this.transcriptBox.classList.remove('empty');
            this.transcriptBox.textContent = this.transcript;
            this.transcriptBox.scrollTop = this.transcriptBox.scrollHeight;
        } else {
            this.transcriptBox.classList.add('empty');
            this.transcriptBox.textContent = 'Your speech will appear here in real-time...';
        }
    }

    copyToClipboard() {
        if (!this.transcript.trim()) {
            this.showNotification('No text to copy', 'error');
            return;
        }

        navigator.clipboard.writeText(this.transcript.trim()).then(() => {
            this.showNotification('Text copied to clipboard!', 'success');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = this.transcript.trim();
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('Text copied to clipboard!', 'success');
        });
    }

    clearTranscript() {
        this.transcript = '';
        this.finalTranscript = '';
        this.updateTranscript();
        this.showNotification('Transcript cleared', 'info');
    }

    showNotification(message, type = 'info') {
        this.notification.textContent = message;
        this.notification.className = `notification ${type}`;
        this.notification.classList.add('show');
        
        setTimeout(() => {
            this.notification.classList.remove('show');
        }, 3000);
    }

    createFloatingParticles() {
        const particlesContainer = document.querySelector('.floating-particles');
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
            particlesContainer.appendChild(particle);
        }
    }
}

// Initialize the app when DOM is loaded

document.addEventListener('DOMContentLoaded', () => {
    new SpeechToTextApp();
});
