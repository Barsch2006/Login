function checkCookies() {
    const cookies = document.cookie
    if (cookies.length > 0) {
        console.log("Cookies accepted")
    } else {
        window.location.href = 'cookie.html'
    }
}