const express = require('express');
const bodyParser = require('body-parser');
const jsdom = require('jsdom');
const { JSDOM, VirtualConsole } = jsdom;

const app = express();
const PORT = 3000;

app.use(bodyParser.json({ limit: "2mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "2mb" }));

app.get('/', (req, res) => {
    res.send("Cookie Execution Server Running.");
});

app.post('/', async (req, res) => {
    const startTime = Date.now();

    try {
        let html = req.body.jscode;

        if (!html || typeof html !== "string") {
            return res.status(400).json({
                success: false,
                error: "jscode missing or invalid"
            });
        }

        console.log("Incoming HTML length:", html.length);

        // Replace AES path if exists
        html = html.replace(
            "/aes.js",
            "https://pastebin.com/raw/pKrFHFzf"
        );

        // Remove static redirects
        html = html.replace(/location\.href\s*=\s*.*?;/g, "");

        // Inject redirect blocker + cookie viewer
        const injection = `
        <script>
        (function(){
            try {
                Object.defineProperty(window, 'location', {
                    value: {
                        href: '',
                        assign: function(){},
                        replace: function(){}
                    },
                    writable: false
                });
            } catch(e){}

            setTimeout(function(){
                document.body.innerHTML += 
                    "<hr><h2>Generated Cookies</h2><pre>" 
                    + document.cookie + "</pre>";
                console.log("Cookies:", document.cookie);
            }, 800);
        })();
        </script>
        `;

        if (html.includes("</body>")) {
            html = html.replace("</body>", injection + "</body>");
        } else {
            html += injection;
        }

        const virtualConsole = new VirtualConsole();
        virtualConsole.on("log", msg => {
            console.log("[PAGE LOG]:", msg);
        });
        virtualConsole.on("error", msg => {
            console.error("[PAGE ERROR]:", msg);
        });

        const dom = new JSDOM(html, {
            runScripts: "dangerously",
            resources: "usable",
            url: "http://localhost",
            pretendToBeVisual: true,
            virtualConsole
        });

        // Execution promise
        const execution = new Promise(resolve => {
            setTimeout(() => {
                resolve(dom.window.document.cookie || null);
            }, 1200);
        });

        // Watchdog timeout
        const watchdog = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error("Execution timeout exceeded"));
            }, 3000);
        });

        const cookies = await Promise.race([execution, watchdog]);

        const duration = Date.now() - startTime;

        console.log("Execution finished in", duration, "ms");
        console.log("Cookies:", cookies);

        res.status(200).json({
            success: true,
            executionTimeMs: duration,
            cookies: cookies,
            renderedHtml: dom.serialize()
        });

    } catch (err) {
        console.error("Execution error:", err);
        res.status(500).json({
            success: false,
            error: "Execution failed",
            details: err.message
        });
    }
});

app.listen(PORT, '127.0.0.1', () => {
    console.log("Server running at http://127.0.0.1:" + PORT);
});                res.status(200).json({
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
