import express from 'express';
import { NextFunction, Request, Response } from 'express';
import pug from 'pug'
const app = express()
const port = 3003

const server = app.listen(port, () => {
    console.log("Server listening on port " + port);
})

app.set("view engine", "pug")
app.set("views", "views")

app.get("/", (req: Request, res: Response, next: NextFunction) => {
    let payload ={
        pageTitle:' Home'
    }
    res.status(200).render("home",payload)
})