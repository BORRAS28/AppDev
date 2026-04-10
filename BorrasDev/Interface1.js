// Loading Animation Functionality
function showLoading() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    loadingOverlay.classList.add('active');
}

function hideLoading() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    loadingOverlay.classList.remove('active');
}


function setupPasswordToggle(toggleId, passwordId) {
    const toggle = document.getElementById(toggleId);
    const passwordInput = document.getElementById(passwordId);
    
    passwordInput.setAttribute('type', 'password');
    
    toggle.classList.remove('fa-eye');
    toggle.classList.add('fa-eye-slash');
    
    toggle.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        if (type === 'text') {
            this.classList.remove('fa-eye-slash');
            this.classList.add('fa-eye');
        } else {
            this.classList.remove('fa-eye');
            this.classList.add('fa-eye-slash');
        }
    });
}

const pcStatusMap = {
    'PC-01': { status: 'Working', keyboard: 'OK', mouse: 'OK' },
    'PC-02': { status: 'Working', keyboard: 'Missing', mouse: 'OK' },
    'PC-03': { status: 'Broken', keyboard: 'OK', mouse: 'OK' },
    'PC-04': { status: 'Working', keyboard: 'OK', mouse: 'Missing' }
};

function updateQrStatusMessage(text, success = true) {
    const qrStatusMessage = document.getElementById('qrStatusMessage');
    if (!qrStatusMessage) return;
    qrStatusMessage.textContent = text;
    qrStatusMessage.style.color = success ? '#2f2f2f' : '#d84315';
}

function showPcStatus(pcId) {
    const details = pcStatusMap[pcId];
    if (!details) {
        updateQrStatusMessage('Generated QR for ' + pcId + '. No status found for this PC.', false);
        return;
    }

    updateQrStatusMessage(`Generated QR for ${pcId}. Status: ${details.status}. Keyboard: ${details.keyboard}. Mouse: ${details.mouse}.`);
}
document.addEventListener('DOMContentLoaded', function() {
    setupPasswordToggle('toggleSignInPassword', 'password');

    const generateButton = document.getElementById('generateQrButton');
    const pcSelect = document.getElementById('pcSelect');
    const qrOutput = document.getElementById('qrOutput');

    if (generateButton) {
        generateButton.addEventListener('click', function() {
            const pcId = pcSelect ? pcSelect.value : '';
            if (!pcId) return;
            const qrCanvas = document.getElementById('qrCodeCanvas');
            if (!qrCanvas || !window.QRious) return;

            new QRious({
                element: qrCanvas,
                value: pcId,
                size: 260,
                level: 'H'
            });

            if (qrOutput) {
                qrOutput.style.display = 'block';
            }
            showPcStatus(pcId);
        });
    }


    const signInForm = document.getElementById('signIn').querySelector('form');
    const signInButton = document.getElementById('submitSignIn');
    signInForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (signInButton) {
            signInButton.classList.add('signing-in');
            signInButton.textContent = 'Signing In...';
        }

        
        showLoading();

        
        setTimeout(() => {
            hideLoading();
            window.location.href = 'homepage.html';
        }, 2000);
    });
});