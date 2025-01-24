require('dotenv').config();
const express = require("express");
const { exec } = require('child_process');
const fs = require('fs'); // Import module fs
const app = express();
app.use(express.json());

// Mảng lưu trữ tối đa 5 kết quả log
let logs = [];
// Biến lưu kết quả successMsg gần nhất của lệnh start.sh
let latestStartLog = "";

function logMessage(message) {
    // Thêm log mới vào mảng
    logs.push(message);
    // Giữ mảng chỉ chứa tối đa 5 phần tử
    if (logs.length > 5) {
        logs.shift();
    }

    // Ghi nội dung vào tệp error.log
    const logContent = logs.join("\n");
    const logFilePath = '/home/hoangminhhmp/domains/hoangminhhmp.serv00.net/logs/error.log';
    fs.writeFileSync(logFilePath, logContent, 'utf8'); // Ghi đè vào tệp
}

// Hàm thực thi lệnh shell chung
function executeCommand(commandToRun, actionName, isStartLog = false) {
    const currentDate = new Date(); // Cập nhật thời gian tại mỗi lần gọi
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

        // Nếu lệnh là start.sh, lưu log thành latestStartLog
        if (isStartLog) {
            latestStartLog = successMsg;
        }
    });
}

// Hàm thực thi lệnh shell cho start.sh
function runShellCommand() {
    const commandToRun = "cd ~/serv00-play/singbox/ && bash start.sh";
    executeCommand(commandToRun, "start.sh", true); // Đánh dấu là log từ start.sh
}

// Hàm KeepAlive để chạy keepalive.sh
function KeepAlive() {
    const commandToRun = "bash /home/hoangminhhmp/serv00-play/keepalive.sh";
    executeCommand(commandToRun, "keepalive.sh");
}

// Tự động chạy lệnh keepalive.sh sau mỗi 20 giây
setInterval(KeepAlive, 20000); // 20000ms = 20 giây

// API endpoint /info để thực thi cả start.sh và keepalive.sh
app.get("/info", function (req, res) {
    runShellCommand(); // Gọi trực tiếp lệnh bash start.sh
    KeepAlive();       // Gọi trực tiếp lệnh bash keepalive.sh
    res.type("html").send("<pre> Serv00 和 KeepAlive 已复活成功！</pre>");
});

// API endpoint /logs_hnvn để hiển thị log từ start.sh
app.get("/logs_hnvn", function (req, res) {
    // Hiển thị latestStartLog của lệnh start.sh gần nhất
    res.type("html").send("<pre>" + latestStartLog + "</pre>");
});

// API endpoint /keepalive để hiển thị toàn bộ log
app.get("/keepalive", function (req, res) {
    res.type("html").send("<pre>" + logs.join("\n") + "</pre>");
});

// 404 xử lý
app.use((req, res, next) => {
    if (req.path === '/info' || req.path === '/logs_hnvn' || req.path === '/keepalive') {
        return next();
    }
    res.status(404).send('页面未找到');
});

// Khởi động server
app.listen(3000, () => {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();
    const startMsg = `${formattedDate} ${formattedTime} 服务器已启动，监听端口 3000`;
    logMessage(startMsg);
});
