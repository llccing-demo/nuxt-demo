// This file is executed once when the server is started
console.log("Setting up socket.io server ...")

// Setup a socket.io server on port 3001 that has CORS disabled (do not set this to port 3000 as port 3000 is where the nuxt dev server serves your nuxt application)
const io = require("socket.io")(3001, {
    cors: {
        // No CORS at all
        origin: '*',
    }
});

io.on('connection', function (socket) {
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });

    // 合伙人预约事件
    socket.on('partner-order', (data) => {
        // io.emit('partner-order', data);
        socket.broadcast.emit("partner-order", data);
    });

    // 合伙人取消预约事件
    socket.on('partner-cancel-order', (data) => {
        // io.emit('partner-cancel-order', data);
        socket.broadcast.emit("partner-cancel-order", data);
    });
})

console.log("socket.io server now sends 'tick' event with 'tickId' parameter every second ...")

// Since we are a serverMiddleware, we have to return a handler, even if this it does nothing
export default function (req, res, next) {
    next()
}