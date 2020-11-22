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

app.use("/login", loginRoute)
app.use("/register", registerRoute)

app.use(requireLogin)
app.get("/", (req: Request, res: Response, next: NextFunction) => {
    let payload = {
        pageTitle: ' Home'
    }
    res.status(200).render("home", payload)
})