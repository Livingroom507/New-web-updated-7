document.addEventListener('DOMContentLoaded', () => {

    // --- Page Navigation Logic ---
    const navLinks = document.querySelectorAll('nav a, .btn, .back-link');
    const pages = document.querySelectorAll('.page');

    function showPage(pageId) {
        // Add '#' if missing
        const targetId = pageId.startsWith('#') ? pageId.substring(1) : pageId;

        pages.forEach(page => {
            if (page.id === targetId) {
                page.classList.remove('hidden');
            } else {
                page.classList.add('hidden');
            }
        });
        window.scrollTo(0, 0); // Scroll to top on page change
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                event.preventDefault();
                // Update URL hash for history
                window.location.hash = href;
            }
        });
    });

    // Handle hash change events (for back/forward buttons and direct URL access)
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash || '#home';
        showPage(hash);
    });

    // Initial page load
    const initialHash = window.location.hash || '#home';
    showPage(initialHash);


    // --- Financial Calculator Logic ---
    const calculateBtn = document.getElementById('calculate-btn');
    const resultDiv = document.getElementById('result');

    calculateBtn.addEventListener('click', () => {
        // 1. Get values from input fields and convert to numbers
        const principal = parseFloat(document.getElementById('principal').value);
        const rate = parseFloat(document.getElementById('rate').value) / 100; // Convert percentage to decimal
        const time = parseFloat(document.getElementById('time').value);
        const compounds = parseInt(document.getElementById('compounds').value);

        // 2. Validate inputs
        if (isNaN(principal) || isNaN(rate) || isNaN(time) || isNaN(compounds) || principal <= 0 || rate <= 0 || time <= 0 || compounds <= 0) {
            resultDiv.textContent = 'Please enter valid, positive numbers in all fields.';
            resultDiv.style.color = '#c0392b'; // Red color for error
            resultDiv.style.borderColor = '#c0392b';
            resultDiv.style.backgroundColor = '#f5b7b1';
            return;
        }

        // 3. Calculate compound interest
        // Formula: A = P(1 + r/n)^(nt)
        const amount = principal * Math.pow((1 + rate / compounds), compounds * time);
        const earnings = amount - principal;

        // 4. Display the result
        resultDiv.innerHTML = `
            Future Value: <strong>$${amount.toFixed(2)}</strong><br>
            Total Earnings: <strong>$${earnings.toFixed(2)}</strong>
        `;
        // Reset styles to success colors
        resultDiv.style.color = '#1e8449';
        resultDiv.style.borderColor = '#58d68d';
        resultDiv.style.backgroundColor = '#eafaf1';
    });
});