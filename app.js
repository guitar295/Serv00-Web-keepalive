require('dotenv').config();
const express = require("express");
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());

// 获取当前用户名 (使用 `whoami` 命令)
const USERNAME = require('child_process').execSync('whoami').toString().trim();

// 最多存储5条日志
let logs = [];
// 存储最近一次 start.sh 成功的信息
let latestStartLog = "";

// 日志记录函数
function logMessage(message) {
    logs.push(message);
    if (logs.length > 5) {
        logs.shift();
    }

    const logContent = logs.join("\n");
    const logFilePath = `${process.env.HOME}/domains/${USERNAME}.serv00.net/logs/error.log`;
    fs.writeFileSync(logFilePath, logContent, 'utf8'); // 覆盖写入文件
}

// 执行通用 shell 命令的函数
function executeCommand(commandToRun, actionName, isStartLog = false) {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();

    exec(commandToRun, function (err, stdout, stderr) {
        const timestamp = `${formattedDate} ${formattedTime}`;
        if (err) {
            const errorMsg = `${timestamp} ${actionName} 执行错误: ${err.message}`;
            logMessage(errorMsg);
            return;
        }

        if (stderr) {
            if (!stderr.includes("Could not open file msg.json: No such file or directory")) {
                const stderrMsg = `${timestamp} ${actionName} 执行标准错误输出: ${stderr}`;
                logMessage(stderrMsg);
            }
        }

        const successMsg = `${timestamp} ${actionName} 执行成功:\n${stdout}`;
        logMessage(successMsg);

        if (isStartLog) {
            latestStartLog = successMsg;
        }
    });
}

// 执行 start.sh 的 shell 命令函数
function runShellCommand() {
    const commandToRun = `
        # Kiểm tra và khởi động lại nếu tiến trình bị dừng
        if ! pgrep -f '[s]erv00sb' > /dev/null || ! pgrep -f '[c]loudflared' > /dev/null; then
            cd ${process.env.HOME}/serv00-play/singbox/ && bash start.sh
        fi
    `;
    executeCommand(commandToRun, "start.sh", true);
}

// 每隔20秒运行 runShellCommand
setInterval(runShellCommand, 20000); // 20000ms = 20秒

// KeepAlive 函数，用于执行 keepalive.sh
function KeepAlive() {
    const commandToRun = `bash ${process.env.HOME}/serv00-play/keepalive.sh`;
    executeCommand(commandToRun, "keepalive.sh");
}

// 每隔20秒自动执行 keepalive.sh
setInterval(KeepAlive, 20000); // 20000ms = 20秒

// API endpoint /info 执行 start.sh 和 keepalive.sh
app.get("/info", function (req, res) {
    runShellCommand();
    KeepAlive();
    res.type("html").send("<pre> Serv00 和 KeepAlive 已成功恢复！</pre>");
});

// API endpoint /node_info 显示 start.sh 的日志
app.get("/node_info", function (req, res) {
    res.type("html").send("<pre>" + latestStartLog + "</pre>");
});

// API endpoint /keepalive 显示所有日志
app.get("/keepalive", function (req, res) {
    res.type("html").send("<pre>" + logs.join("\n") + "</pre>");
});

// 404 处理
app.use((req, res, next) => {
    if (req.path === '/info' || req.path === '/node_info' || req.path === '/keepalive') {
        return next();
    }
    res.status(404).send('页面未找到');
});

// 启动服务器
app.listen(3000, () => {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();
    const startMsg = `${formattedDate} ${formattedTime} 服务器已启动，监听端口 3000`;
    logMessage(startMsg);
});
