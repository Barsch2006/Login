function checkCookies() {
    const cookies = document.cookie
    if (cookies.length > 0) {
        document.querySelector('.cookies').style.display = "none";
    } else {
        document.querySelector('main #app').style.filter = "blur(4px)"
    }
}

function setCookies() {
    if (document.querySelector('#datenschutz_check').checked && document.querySelector('#cookies_check').checked) {
        document.cookie = 'cookies', 'true', { maxAge: 86400000, httpOnly: true } // Cookie guilty for 24h
        checkCookies()
    }
}