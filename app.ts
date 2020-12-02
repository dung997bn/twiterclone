import express from 'express';
import { NextFunction, Request, Response } from 'express';
import pug from 'pug'
import { requireLogin } from './middleware'
import path from 'path'
import bodyParser from 'body-parser'
import Database from './database'
import session from 'express-session';
import Config from './config';

const config = new Config()
const app = express()
const port = 3003

const dataBase = new Database()

const server = app.listen(port, () => {
    console.log("Server listening on port " + port);
})
const io = require('socket.io')(server, {
    pingTimeout: 60000
})

app.use(bodyParser.urlencoded({ extended: false }))

app.set("view engine", "pug")
app.set("views", "views")

app.use(express.static(path.join(__dirname, "public")))
app.use(session({
    secret: config.getSecret(),
    resave: true,
    saveUninitialized: false
}))
//Routes
const loginRoute = require('./routes/loginRoute')
const registerRoute = require('./routes/registerRoute')
const logoutRoute = require('./routes/logout');
const postsApiRoute = require('./routes/api/posts');
const userApiRoute = require('./routes/api/users');
const chatsApiRoute = require('./routes/api/chats');
const messagesApiRoute = require('./routes/api/messages');

//Access root
const uploadsRoute = require('./routes/uploadsRoute')
//Route view
const postRoute = require('./routes/postRoute')
const profileRoute = require('./routes/profileRoute')
const searchRoute = require('./routes/searchRoute')
const messagesRoute = require('./routes/messagesRoute')

app.use("/login", loginRoute)
app.use("/register", registerRoute)
app.use("/logout", logoutRoute)
app.use("/api/posts", postsApiRoute)
app.use("/api/users", userApiRoute)
app.use("/api/chats", chatsApiRoute)
app.use("/api/messages", messagesApiRoute)

//allow client access root of server
app.use("/uploads", uploadsRoute)

app.use(requireLogin)

//Render view

app.use('/messages', messagesRoute)
app.use('/posts', postRoute)
app.use('/profile', profileRoute)
app.use('/search', searchRoute)
app.get("/", (req: Request, res: Response, next: NextFunction) => {
    let user = req.app.get('user')
    if (!user)
        res.redirect('/login')
    let payload = {
        pageTitle: ' Home',
        userLoggedIn: user,
        userLoggedInClient: JSON.stringify(user)
    }
    res.status(200).render("home", payload)
})


io.on("connection", (socket: any) => {

    socket.on("setup", (userData: any) => {
        socket.join(userData._id)
        socket.emit("connected")
    })

    socket.on("join room", (room: string) => {
        socket.join(room)
    })

    socket.on("typing", (room: string) => {
        socket.in(room).emit("typing")
    })

    socket.on("stop typing", (room: string) => {
        socket.in(room).emit("stop typing")
    })
})