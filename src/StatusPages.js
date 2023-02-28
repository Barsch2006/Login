exports.StatusPages = class StatusPages {
    /**
     * statusCode = 404
     * @returns { string } HTMLCode für den StatusCode 404
     */
    static http404() {
        return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>404 Not Found</title><link rel="icon" href="logo.ico" type="image/x-icon"><link rel="stylesheet" href="style.css"><script src="index.js" defer></script></head><body><section class="fixed-header"><div><p>Gymnasium Riedberg</p></div></section><header><div onclick="window.location='/'"><img src="logo.ico" alt="Logo"><h1 class="onHideMobile">Gymnasium Riedberg - </h1><h1>Wahltool</h1></div></header><main><section class="error_screen"><h1>404 Not Found</h1><p>Der angegebene Pfad konnte nicht gefunden werden</p></section></main><footer><a href="impressum.html">Impressum</a><a href="policy.html">Datenschutz</a></footer></body></html>`;
    }

    /**
     * statusCode = 403
     * @returns { string } HTML Code für den StatusCode 403
     */
    static http403() {
        return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>403 Kein Zugriff</title><link rel="icon" href="logo.ico" type="image/x-icon"><link rel="stylesheet" href="style.css"><script src="index.js" defer></script></head><body><section class="fixed-header"><div><p>Gymnasium Riedberg</p></div></section><header><div onclick="window.location='/'"><img src="logo.ico" alt="Logo"><h1 class="onHideMobile">Gymnasium Riedberg - </h1><h1>Wahltool</h1></div></header><main><section class="error_screen"><h1>403 Kein Zugriff</h1><p>Sie haben auf diesen Inhalt keinen Zugriff</p></section></main><footer><a href="impressum.html">Impressum</a><a href="policy.html">Datenschutz</a></footer></body></html>`;
    }
}