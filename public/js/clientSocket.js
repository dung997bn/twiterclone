let connected = false

let socket = io('http://localhost:3003')
socket.emit("setup", userLoggedInClient)
socket.on("connected", () => {
    connected = true
    console.log("socket io is connected");
})