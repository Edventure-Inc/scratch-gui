var path = require('path');
var express = require('express');
var app = express();
const PORT = 7779;

app.use(express.static(path.join(__dirname, '../build/'), {
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.set('Cache-Control', 'no-cache');
        }
    }
}));

app.use(function (req, res) {
    res.set('Cache-Control', 'no-cache');
    res.sendFile(path.join(__dirname, '../build/'));
});

app.listen(PORT, function () {
    console.log(`The app server is working at ${ PORT}`);
});
