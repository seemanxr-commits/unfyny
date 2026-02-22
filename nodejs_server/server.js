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

app.post('/', async function(req, res) {
    const startTime = Date.now();

    try {
        console.log("Incoming request...");

        let jscode = req.body.jscode;

        if (!jscode || typeof jscode !== "string") {
            console.error("Invalid or missing jscode");
            return res.status(400).json({
                success: false,
                error: "jscode missing or invalid"
            });
        }

        console.log("Original length:", jscode.length);

        // Replace AES path
        jscode = jscode.replace(
            "/aes.js",
            "https://pastebin.com/raw/pKrFHFzf"
        );

        // Disable redirect
        jscode = jscode.replace(
            /location\.href/g,
            "var disabledRedirect"
        );

        console.log("Modified length:", jscode.length);

        const dom = new JSDOM(jscode, {
            runScripts: "dangerously",
            resources: "usable",
            url: "http://localhost",
            pretendToBeVisual: true,
            virtualConsole: new (require("jsdom")).VirtualConsole()
                .sendTo(console)
        });

        setTimeout(() => {
            try {
                const cookies = dom.window.document.cookie;
                const duration = Date.now() - startTime;

                console.log("Execution finished in", duration, "ms");
                console.log("Cookies:", cookies);

                res.status(200).json({
                    success: true,
                    executionTimeMs: duration,
                    cookies: cookies || null
                });

            } catch (innerErr) {
                console.error("Cookie extraction error:", innerErr);
                res.status(500).json({
                    success: false,
                    error: "Failed to read cookies",
                    details: innerErr.message
                });
            }
        }, 500);

    } catch (err) {
        console.error("Execution error:", err);
        res.status(500).json({
            success: false,
            error: "Execution failed",
            details: err.message
        });
    }
});

const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
