require('dotenv').config();
const express = require("express");
const { exec, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const app = express();

const USERNAME = execSync('whoami').toString().trim();

app.use(express.json());
let logs = [];

function logMessage(message) {
    logs.push(message);
    if (logs.length > 5) logs.shift();
    const logContent = logs.join("\n");
    const logFilePath = `${process.env.HOME}/domains/${USERNAME}.serv00.net/logs/error.log`;
    fs.writeFileSync(logFilePath, logContent, 'utf8');
}

function executeCommand(command, actionName, callback) {
    exec(command, (err, stdout, stderr) => {
        const timestamp = new Date().toLocaleString();
        if (err) {
            logMessage(`${actionName} 执行失败: ${err.message}`);
            if (callback) callback(err.message);
            return;
        }
        if (stderr) {
            logMessage(`${actionName} 执行标准错误输出: ${stderr}`);
        }
        const successMsg = `${actionName} 执行成功:\n${stdout}`;
        logMessage(successMsg);
        if (callback) callback(stdout);
    });
}

function runShellCommand() {
    const command = `cd ${process.env.HOME}/serv00-play/singbox/ && bash start.sh`;
    executeCommand(command, "start.sh");
}

function executeHy2ipScript(logMessages, callback) {
    const username = process.env.USER.toLowerCase(); // 获取当前用户名并转换为小写
    const command = `cd ${process.env.HOME}/domains/${username}.serv00.net/public_nodejs/ && bash hy2ip.sh`;

    // 执行脚本并捕获输出
    exec(command, (error, stdout, stderr) => {
        callback(error, stdout, stderr);
    });
}

function KeepAlive() {
    const command = `cd ${process.env.HOME}/serv00-play/ && bash keepalive.sh`;
    executeCommand(command, "keepalive.sh");
}

setInterval(KeepAlive, 20000);

app.get("/info", (req, res) => {
    runShellCommand();
    KeepAlive();
    res.type("html").send(`
        <html>
        <head>
            <style>
                body {
                    margin: 0;
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
                .content-container {
                    width: 100%;
                    max-width: 600px; /* 最大宽度为600px */
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                    box-sizing: border-box;
                    text-align: left; /* 保持文字左对齐 */
                }
                .dynamic-text {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 20px;
                    line-height: 1.5;
                    text-align: center; /* 两行文本居中 */
                }
                @keyframes growShrink {
                    0% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.2);
                    }
                    100% {
                        transform: scale(1);
                    }
                }
                .dynamic-text span {
                    display: inline-block;
                    animation: growShrink 1.2s infinite;
                    animation-delay: calc(0.1s * var(--char-index));
                }
                .button-container {
                    margin-top: 20px;
                    display: flex;
                    flex-wrap: wrap; /* 适配小屏，按钮会换行 */
                    gap: 10px;
                }
                button {
                    flex: 1;
                    min-width: 100px;
                    padding: 10px 15px;
                    font-size: 16px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }
                button:hover {
                    background-color: #0056b3;
                }
                @media (max-width: 600px) {
                    .dynamic-text {
                        font-size: 20px;
                    }
                    button {
                        font-size: 14px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="content-container">
                <div class="dynamic-text">
                    ${"SingBox 已复活".split("").map((char, index) => 
                        `<span style="--char-index: ${index};">${char}</span>`).join("")}
                </div>
                <div class="dynamic-text">
                    ${"HtmlOnLive 守护中".split("").map((char, index) => 
                        `<span style="--char-index: ${index + 10};">${char}</span>`).join("")}
                </div>
                <div class="button-container">
                    <button onclick="window.location.href='/hy2ip'">换HY2_IP</button>
                    <button onclick="window.location.href='/node'">节点信息</button>
                    <button onclick="window.location.href='/log'">查看日志</button>
                </div>
            </div>
        </body>
        </html>
    `);
});

// 中间件：解析请求体
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/hy2ip", (req, res) => {
    res.send(`
        <html>
            <head>
                <title>HY2_IP 更新</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        width: 100vw;
                        overflow: hidden;
                    }
                    .container {
                        width: 95%;
                        max-width: 600px;
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                        box-sizing: border-box;
                        text-align: left;
                    }
                    h1 {
                        font-size: 24px;
                        margin-bottom: 15px;
                    }
                    p {
                        font-size: 16px;
                        margin-bottom: 20px;
                        color: #555;
                        line-height: 1.5;
                    }
                    input[type="text"] {
                        width: 100%;
                        padding: 12px;
                        font-size: 16px;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        box-sizing: border-box;
                        margin-bottom: 15px;
                        text-align: center;
                        transition: 0.3s;
                    }
                    input[type="text"]:focus {
                        border-color: #007bff;
                        outline: none;
                        box-shadow: 0 0 8px rgba(0, 123, 255, 0.5);
                    }
                    button {
                        width: 100%;
                        padding: 12px;
                        font-size: 18px;
                        background-color: #007bff;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        transition: 0.3s;
                    }
                    button:hover {
                        background-color: #0056b3;
                        transform: scale(1.05);
                    }
                    @media (max-width: 600px) {
                        .container {
                            padding: 15px;
                        }
                        h1 {
                            font-size: 20px;
                        }
                        p {
                            font-size: 14px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>HY2_IP 更新</h1>
                    <p>请输入 <b>更新</b> 以确认执行 IP 更新。</p>
                    <form action="/hy2ip/execute" method="POST">
                        <input type="text" name="confirmation" placeholder="更新">
                        <button type="submit">提交</button>
                    </form>
                    <p>⚠️ 不同 IP 更新后原线路会失效，请复制新信息使用。</p>
                </div>
            </body>
        </html>
    `);
});

app.post("/hy2ip/execute", (req, res) => {
    const confirmation = req.body.confirmation?.trim();

    if (confirmation !== "更新") {
        return res.send(`
            <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <title>HY2_IP 更新失败</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f4;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                            padding: 0 10px;
                        }
                        .container {
                            width: 90%;
                            max-width: 600px;
                            background-color: #fff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                            text-align: left;
                        }
                        h1 {
                            font-size: 22px;
                            margin-bottom: 15px;
                        }
                        p {
                            font-size: 16px;
                            color: red;
                        }
                        a {
                            color: #007bff;
                            text-decoration: none;
                        }
                        a:hover {
                            text-decoration: underline;
                        }
                        @media (max-width: 600px) {
                            .container {
                                padding: 15px;
                            }
                            h1 {
                                font-size: 20px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>更新失败</h1>
                        <p>输入错误！请返回并输入“更新”以确认。</p>
                        <a href="/hy2ip">返回</a>
                    </div>
                </body>
            </html>
        `);
    }

    try {
        let logMessages = [];

        executeHy2ipScript(logMessages, (error, stdout, stderr) => {
            let updatedIp = "";

            if (stdout) {
                let outputMessages = stdout.split("\n");
                outputMessages.forEach(line => {
                    if (line.includes("SingBox 配置文件成功更新IP为")) {
                        updatedIp = line.split("SingBox 配置文件成功更新IP为")[1].trim();
                    }
                    if (line.includes("Config 配置文件成功更新IP为")) {
                        updatedIp = line.split("Config 配置文件成功更新IP为")[1].trim();
                    }
                });
                // 去掉 ANSI 颜色码
                if (updatedIp) {
                    updatedIp = updatedIp.replace(/\x1B\[[0-9;]*m/g, "");
                }
                if (updatedIp && updatedIp !== "未找到可用的 IP！") {
                    logMessages.push("命令执行成功");
                    logMessages.push(`SingBox 配置文件成功更新IP为 ${updatedIp}`);
                    logMessages.push(`Config 配置文件成功更新IP为 ${updatedIp}`);
                    logMessages.push("sing-box 已重启");
                } else {
                    logMessages.push("命令执行成功");
                    logMessages.push("没有找到有效 IP");
                }
                while (logMessages.length > 10) {
                    logMessages.shift(); 
                }
                res.send(generateHtml("HY2_IP 更新", updatedIp || "无", logMessages));
            }
        });
    } catch (error) {
        let logMessages = ["命令执行成功", "没有找到有效 IP"];
        res.send(generateHtml("HY2_IP 更新", "无", logMessages, true));
    }
});

// 生成 HTML 页面
function generateHtml(title, ip, logs, isError = false) {
    let ipColor = isError ? "red" : "black";
    let htmlLogs = logs.map(msg => `<p>${msg}</p>`).join("");

    return `
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>${title}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        padding: 0 10px;
                    }
                    .container {
                        width: 90%;
                        max-width: 800px;
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                        text-align: left;
                    }
                    h1 {
                        font-size: 24px;
                        margin-bottom: 20px;
                        text-align: left;
                    }
                    p {
                        font-size: 16px;
                    }
                    .scrollable {
                        max-height: 300px;
                        overflow-y: auto;
                        border: 1px solid #ccc;
                        padding: 10px;
                        background-color: #f9f9f9;
                        border-radius: 4px;
                    }
                    .ip {
                        font-weight: bold;
                        color: ${ipColor};
                    }
                    @media (max-width: 600px) {
                        .container {
                            padding: 15px;
                        }
                        h1 {
                            font-size: 22px;
                        }
                        .scrollable {
                            max-height: 200px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>${title}</h1>
                    <p><strong>有效 IP：</strong> <span class="ip">${ip}</span></p>
                    <div>
                        <h2>日志:</h2>
                        <div class="scrollable">
                            ${htmlLogs}
                        </div>
                    </div>
                </div>
            </body>
        </html>
    `;
}

app.get("/node", (req, res) => {
    const filePath = path.join(process.env.HOME, "serv00-play/singbox/list");
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            res.type("html").send(`<pre>无法读取文件: ${err.message}</pre>`);
            return;
        }

        const cleanedData = data
            .replace(/(vmess:\/\/|hysteria2:\/\/|proxyip:\/\/|https:\/\/)/g, '\n$1')
            .trim();

        const vmessPattern = /vmess:\/\/[^\n]+/g;
        const hysteriaPattern = /hysteria2:\/\/[^\n]+/g;
        const httpsPattern = /https:\/\/[^\n]+/g;
        const proxyipPattern = /proxyip:\/\/[^\n]+/g;
        const vmessConfigs = cleanedData.match(vmessPattern) || [];
        const hysteriaConfigs = cleanedData.match(hysteriaPattern) || [];
        const httpsConfigs = cleanedData.match(httpsPattern) || [];
        const proxyipConfigs = cleanedData.match(proxyipPattern) || [];
        const allConfigs = [...vmessConfigs, ...hysteriaConfigs, ...httpsConfigs, ...proxyipConfigs];

        let htmlContent = `
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
                <title>节点信息</title>
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        padding: 10px;
                    }
                    .content-container {
                        width: 90%;
                        max-width: 600px;
                        background-color: #fff;
                        padding: 15px;
                        border-radius: 8px;
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                        text-align: left;
                        box-sizing: border-box;
                    }
                    h3 {
                        font-size: 20px;
                        margin-bottom: 10px;
                        text-align: center;
                    }
                    .config-box {
                        max-height: 65vh;
                        overflow-y: auto;
                        border: 1px solid #ccc;
                        padding: 8px;
                        background-color: #f9f9f9;
                        box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.1);
                        border-radius: 5px;
                        white-space: pre-wrap;
                        word-break: break-word;
                        font-size: 14px;
                    }
                    .copy-btn {
                        display: block;
                        width: 100%;
                        padding: 12px;
                        font-size: 16px;
                        background-color: #007bff;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        text-align: center;
                        margin-top: 15px;
                        transition: background-color 0.3s;
                    }
                    .copy-btn:hover {
                        background-color: #0056b3;
                    }
                    @media (max-width: 600px) {
                        .content-container {
                            padding: 12px;
                        }
                        .config-box {
                            font-size: 13px;
                        }
                        .copy-btn {
                            font-size: 15px;
                            padding: 10px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="content-container">
                    <h3>节点信息</h3>
                    <div class="config-box" id="configBox">
        `;

        allConfigs.forEach((config) => {
            htmlContent += `<div>${config.trim()}</div>`; // 去掉首尾空格
        });

        htmlContent += `
                    </div>
                    <button class="copy-btn" onclick="copyToClipboard()">一键复制</button>
                </div>

                <script>
                    function copyToClipboard() {
                        const element = document.getElementById("configBox");
                        let text = Array.from(element.children)
                            .map(child => child.textContent.trim())
                            .join("\\n");

                        navigator.clipboard.writeText(text).then(() => {
                            alert("已复制到剪贴板！");
                        }).catch(() => {
                            alert("复制失败，请手动复制！");
                        });
                    }
                </script>
            </body>
            </html>
        `;
        res.type("html").send(htmlContent);
    });
});

app.get("/log", (req, res) => {
    const command = "ps aux"; 
    exec(command, (err, stdout, stderr) => {
        if (err) {
            return res.type("html").send(`
                <pre><b>最近日志:</b>\n${logs[logs.length - 1] || "暂无日志"}</pre>
                <pre><b>进程详情:</b>\n执行错误: ${err.message}</pre>
            `);
        }
        const processOutput = stdout.trim(); 
        const latestLog = logs[logs.length - 1] || "暂无日志";
        res.type("html").send(`
            <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
                    <title>日志与进程详情</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 0;
                            background-color: #f4f4f4;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                        }

                        .container {
                            width: 95%; /* 让内容接近屏幕边缘 */
                            max-width: 1200px; /* 避免大屏过宽 */
                            background-color: #fff;
                            padding: 15px;
                            border-radius: 8px;
                            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                            text-align: left;
                            box-sizing: border-box;
                            min-height: 95vh; /* 适配 16:9，减少上下留白 */
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                        }

                        /* 最近日志部分 */
                        pre.log {
                            margin-bottom: 15px;
                            white-space: pre-wrap; /* 自动换行 */
                            word-wrap: break-word;
                            overflow-wrap: break-word;
                            border: 1px solid #ccc;
                            padding: 10px;
                            background-color: #f9f9f9;
                            box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.1);
                            border-radius: 5px;
                        }

                        /* 进程详情部分 */
                        .scrollable {
                            max-height: 60vh;
                            overflow-x: auto;
                            white-space: nowrap;
                            border: 1px solid #ccc;
                            padding: 10px;
                            background-color: #f9f9f9;
                            box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.1);
                            border-radius: 5px;
                        }

                        pre {
                            margin: 0;
                        }

                        @media (max-width: 600px) {
                            .container {
                                width: 98%; /* 在手机上更贴边 */
                                min-height: 98vh; /* 贴合屏幕 */
                            }
                            .scrollable {
                                max-height: 50vh;
                            }
                        }

                        @media (min-width: 1200px) {
                            .container {
                                max-width: 1000px; /* 避免超宽屏幕内容过散 */
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <pre class="log"><b>最近日志:</b>\n${latestLog}</pre>
                        <div class="scrollable">
                            <pre><b>进程详情:</b>\n${processOutput}</pre>
                        </div>
                    </div>
                </body>
            </html>
        `);
    });
});
app.use((req, res, next) => {
    const validPaths = ["/info", "/hy2ip", "/node", "/log"];
    if (validPaths.includes(req.path)) {
        return next();
    }
    res.status(404).send("页面未找到");
});
app.listen(3000, () => {
    const timestamp = new Date().toLocaleString();
    const startMsg = `${timestamp} 服务器已启动，监听端口 3000`;
    logMessage(startMsg);
});
