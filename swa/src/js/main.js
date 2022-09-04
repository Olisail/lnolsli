(function () {
    function reCaptchaExecute(key, action) {
        return new Promise((resolve, reject) => {
            grecaptcha.ready(() =>
                grecaptcha.execute(key, { action }).then(
                    token => resolve(token),
                    reject
                )
            );
        });
    }

    async function getEmail(e) {
        e.preventDefault();

        /* get the element, e.target sometimes catches the children too */
        const element = document.getElementById('mailto');
        element.classList.add('wait');

        try {
            const token = await reCaptchaExecute('6LeaV84hAAAAAJqjpF9ffx40xmBGk4vLO2vu3EsO', 'RetrieveEmail');

            const response = await fetch('/api/RetrieveEmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ challenge: token })
            });

            if (response.status !== 200) {
                throw new Error('Error, the captcha was not validated!');
            }

            const email = await response.text();

            const fakeEmail = 'dont@bot.me';
            let currentHref = element.getAttribute('href');
            if (currentHref.includes(fakeEmail)) {
                currentHref = currentHref.replace(fakeEmail, email);
                element.setAttribute('href', currentHref);
            }

            window.location.href = currentHref;
        } catch (error) {
            console.warn('Error detected while validating the captcha!', JSON.stringify(error));
        }

        element.classList.remove('wait');
    }

    document.getElementById('mailto').addEventListener('click', getEmail);
})();
