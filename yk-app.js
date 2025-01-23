require('dotenv').config();
const express = require("express");
const { exec } = require('child_process');
const path = require('path'); // 添加 path 模块
const app = express();
app.use(express.json());

// 存储最多1条日志
let logs = [];

// 日志记录函数
function logMessage(message) {
    // 将新的日志加入数组
    logs.push(message);
    // 保持数组最多包含1个元素
    if (logs.length > 1) {
        logs.shift();
    }
}

// 执行通用的 shell 命令函数
function executeCommand(commandToRun, actionName) {
    const currentDate = new Date(); // 每次调用时更新时间
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
            const stderrMsg = `${timestamp} ${actionName} 执行标准错误输出: ${stderr}`;
            logMessage(stderrMsg);
        }
        const successMsg = `${timestamp} ${actionName} 执行成功:\n${stdout}`;
        logMessage(successMsg);
    });
}

// 执行 serv00.sh 的 shell 命令函数
function runShellCommand() {
    const commandToRun = `cd ${process.env.HOME}/&& bash serv00.sh`;
    executeCommand(commandToRun, "serv00.sh");
}

// KeepAlive 函数，执行 serv00keep.sh
function KeepAlive() {
    const commandToRun = `if ! ps aux | grep '[c]onfig' > /dev/null || ! ps aux | grep [l]ocalhost > /dev/null; then /bin/bash ${process.env.HOME}/serv00keep.sh; fi`;
    executeCommand(commandToRun, "serv00keep.sh");
}

// 每隔20秒自动执行 serv00keep.sh
setInterval(KeepAlive, 20000); // 20000ms = 20秒

// API endpoint /info 执行 serv00.sh 和 serv00keep.sh
app.get("/info", function (req, res) {
    runShellCommand(); // 直接调用 bash serv00.sh 命令
    KeepAlive();       // 直接调用 bash serv00keep.sh 命令
    res.type("html").send("<pre> Serv00 和 KeepAlive 已复活成功！</pre>");
});

// API endpoint /keepalive 显示所有日志
app.get("/keepalive", function (req, res) {
    res.type("html").send("<pre>" + logs.join("\n") + "</pre>");
});

// 404 处理
app.use((req, res, next) => {
    if (req.path === '/info' || req.path === '/keepalive') {
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
