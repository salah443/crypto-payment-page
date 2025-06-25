document.addEventListener('DOMContentLoaded', () => {
    const amountEl = document.getElementById('payment-amount');
    const addressEl = document.getElementById('payment-address');
    const qrCodeContainer = document.getElementById('qrcode-container');
    const copyBtn = document.getElementById('copy-button');
    const addressOnlyBtn = document.getElementById('qr-address-only');
    const withAmountBtn = document.getElementById('qr-with-amount');
    const paymentInfoEl = document.getElementById('payment-info');

    const urlParams = new URLSearchParams(window.location.search);
    const address = urlParams.get('address');
    const amount = urlParams.get('amount');
    const currency = urlParams.get('currency');

    if (!address || !amount || !currency) {
        paymentInfoEl.innerHTML = `
            <div class="warning-box">
                <strong>Error:</strong> Payment information is missing or invalid. 
                Please go back to the bot and try the /subscribe command again.
            </div>`;
        return;
    }

    amountEl.textContent = `${amount} ${currency.toUpperCase()}`;
    addressEl.textContent = address;

    let qrCodeInstance = null;

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

    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(address).then(() => {
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = '✓';
            setTimeout(() => {
                copyBtn.innerHTML = originalIcon;
            }, 1500);
        }).catch(err => {
            console.error('Failed to copy address: ', err);
            alert('Could not copy address. Please select it manually.');
        });
    });

    generateQRCode(false);
});