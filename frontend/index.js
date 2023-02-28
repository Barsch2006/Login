function checkCookies() {
    const cookies = document.cookie
    if (cookies.length > 0) {
        console.log("Cookies accepted")
    } else {
        window.location.href = 'cookies.html'
    }
}

function checkURI() {
    if (containsWrongParam(new URL(window.location))) {
        document.querySelector('#wrong').style.display = "block";
    } else {
        document.querySelector('#wrong').style.display = "none";
    }
}

function containsWrongParam(url) {
    const params = new URLSearchParams(url.search);
    return params.has('wrong') && params.get('wrong') === 'true';
}