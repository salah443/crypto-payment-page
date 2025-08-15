document.addEventListener('DOMContentLoaded', () => {
    // Element selectors
    const amountEl = document.getElementById('payment-amount');
    const addressEl = document.getElementById('payment-address');
    const qrCodeContainer = document.getElementById('qrcode-container');
    const copyBtn = document.getElementById('copy-button');
    const addressOnlyBtn = document.getElementById('qr-address-only');
    const withAmountBtn = document.getElementById('qr-with-amount');
    const paymentView = document.getElementById('payment-view');
    const confirmationView = document.getElementById('confirmation-view');
    const paidBtn = document.getElementById('paid-button');
    const timeLeftEl = document.getElementById('time-left');
    const timerContainer = document.getElementById('timer-container');

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const address = urlParams.get('address');
    const amount = urlParams.get('amount');
    const currency = urlParams.get('currency');

    // Validate parameters
    if (!address || !amount || !currency) {
        paymentView.innerHTML = `
            <div class="warning-box">
                <strong>Error:</strong> Payment information is missing or invalid. 
                Please return to the bot and use the /subscribe command again.
            </div>`;
        return;
    }

    // --- INITIALIZE UI ---
    amountEl.textContent = `${amount} ${currency.toUpperCase()}`;
    addressEl.textContent = address;
    document.title = `Pay ${amount} ${currency.toUpperCase()} - Signalyst`;

    let qrCodeInstance = null;
    let timerInterval = null;

    // --- QR CODE LOGIC ---
    function generateQRCode(withAmount = false) {
        qrCodeContainer.innerHTML = '';
        const qrText = withAmount 
            ? `tron:${address}?amount=${amount}` 
            : address;

        qrCodeInstance = new QRCode(qrCodeContainer, {
            text: qrText,
            width: 170,
            height: 170,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }

    addressOnlyBtn.addEventListener('click', () => {
        generateQRCode(false);
        addressOnlyBtn.classList.add('active');
        withAmountBtn.classList.remove('active');
    });

    withAmountBtn.addEventListener('click', () => {
        generateQRCode(true);
        withAmountBtn.classList.add('active');
        addressOnlyBtn.classList.remove('active');
    });

    // --- COPY BUTTON LOGIC ---
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(address).then(() => {
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = '✓';
            copyBtn.style.color = 'var(--success-color)';
            setTimeout(() => {
                copyBtn.innerHTML = originalIcon;
                copyBtn.style.color = 'var(--secondary-text)';
            }, 1500);
        }).catch(err => {
            console.error('Failed to copy address: ', err);
            alert('Could not copy address. Please select it manually.');
        });
    });

    // --- PAYMENT TIMER LOGIC ---
    let timeInSeconds = 15 * 60; // 15 minutes
    function startTimer() {
        timerInterval = setInterval(() => {
            timeInSeconds--;
            const minutes = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
            const seconds = (timeInSeconds % 60).toString().padStart(2, '0');
            timeLeftEl.textContent = `${minutes}:${seconds}`;

            if (timeInSeconds <= 0) {
                clearInterval(timerInterval);
                paymentView.innerHTML = `
                    <div class="warning-box">
                        <strong>Session Expired</strong>
                        <p>This payment request has expired. Please return to the bot and generate a new one.</p>
                    </div>`;
            }
        }, 1000);
    }

    // --- "I HAVE PAID" BUTTON LOGIC ---
    paidBtn.addEventListener('click', () => {
        clearInterval(timerInterval); // Stop the timer
        paymentView.style.display = 'none';
        confirmationView.style.display = 'block';
    });


    // --- START EVERYTHING ---
    generateQRCode(false); // Initial QR code
    startTimer();
});
