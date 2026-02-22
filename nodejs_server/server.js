const express = require('express');
const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

app.get('/', function(req, res) {
    res.send("ok.");
});

app.post('/', (req, res) => {
    let jscode = req.body.jscode;

    if (!jscode) {
        return res.status(400).send("jscode missing in request body");
    }

    jscode = jscode.replace("/aes.js", "https://pastebin.com/raw/pKrFHFzf");
    jscode = jscode.replace(/location\.href/g, "var uselessvar12345");

    const dom = new JSDOM(jscode, {
        runScripts: "dangerously",
        resources: "usable"
    });

    setTimeout(() => {
        res.send(dom.window.document.cookie || "No cookies set.");
    }, 500);
});

const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
