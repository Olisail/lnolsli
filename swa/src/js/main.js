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

    async function retrieveContactInformation() {
        try {
            const token = await reCaptchaExecute('6LeaV84hAAAAAJqjpF9ffx40xmBGk4vLO2vu3EsO', 'RetrieveContactInformation');

            const response = await fetch('/api/RetrieveContactInformation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ challenge: token })
            });

            if (response.status !== 200) {
                throw new Error('Error, the captcha was not validated!');
            }

            return await response.json();
        } catch (error) {
            console.warn('Error detected while validating the captcha!', JSON.stringify(error));
            return null;
        }
    }

    async function updateElementHrefAndClick(e, elementId, resultKey, valueToReplace, action = uri => window.open(uri)) {
        e.preventDefault();

        /* get the element, e.target sometimes catches the children too */
        const element = document.getElementById(elementId);

        let currentHref = element.getAttribute('href');
        if (!currentHref.includes(valueToReplace)) {
            return action(currentHref);
        }

        element.classList.add('wait');

        const result = await retrieveContactInformation();

        element.classList.remove('wait');

        if (!result) {
            return;
        }

        const value = result[resultKey];

        currentHref = currentHref.replace(valueToReplace, value);
        element.setAttribute('href', currentHref);

        return action(currentHref);
    }

    function getEmail(e) {
        const elementId = 'mailto';
        const resultKey = 'email';
        const fakeEmail = 'dont@bot.me';
        
        return updateElementHrefAndClick(e, elementId, resultKey, fakeEmail);
    }

    async function getCallMeUri(e) {
        const elementId = 'callme';
        const resultKey = 'callMeUri';
        const fakeUri = '#bots-dont-call-me';
        
        return updateElementHrefAndClick(e, elementId, resultKey, fakeUri, uri => window.open(uri, '_blank').focus());
    }

    document.getElementById('mailto').addEventListener('click', getEmail);
    document.getElementById('callme').addEventListener('click', getCallMeUri);
})();
