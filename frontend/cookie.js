function setCookies() {
    if (document.querySelector('#datenschutz_check').checked && document.querySelector('#cookies_check').checked) {
        document.cookie = 'cookies', 'true', { maxAge: 86400000, httpOnly: true } // Cookie guilty for 24h
        window.location.href = '/'
    }
}