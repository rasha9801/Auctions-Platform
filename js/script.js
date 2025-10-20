     // ==== Language Toggle RTL/LTR ====
        document.addEventListener("DOMContentLoaded", () => {
            const langBtn = document.querySelector('.navbar .btn.text-light.ms-4[style*="#111"]');

            if (langBtn) {
                langBtn.addEventListener('click', () => {
                    const html = document.documentElement;

                    if (html.dir === 'rtl') {
                        // Switch to English (LTR)
                        html.dir = 'ltr';
                        html.lang = 'en';
                        langBtn.textContent = 'العربية';
                        document.body.style.textAlign = 'left';
                    } else {
                        // Switch to Arabic (RTL)
                        html.dir = 'rtl';
                        html.lang = 'ar';
                        langBtn.textContent = 'English';
                        document.body.style.textAlign = 'right';
                    }
                });
            }
        });