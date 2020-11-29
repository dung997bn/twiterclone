import express from 'express';
import { NextFunction, Request, Response } from 'express';

const router = express.Router()

router.get("/", (req: Request, res: Response, next: NextFunction) => {
    const user = req.app.get('user')
    const root = 'http://localhost:3003'
    var payload = {
        pageTitle: 'Inbox',
        userLoggedInClient: JSON.stringify(user),
        userLoggedIn: user,
        profileUser: user,
        root
    }
    res.status(200).render("inboxPage", payload);
})
router.get("/new", (req: Request, res: Response, next: NextFunction) => {
    const user = req.app.get('user')
    const root = 'http://localhost:3003'
    var payload = {
        pageTitle: 'New message',
        userLoggedInClient: JSON.stringify(user),
        userLoggedIn: user,
        profileUser: user,
        root
    }
    res.status(200).render("newMessagePage", payload);
})

module.exports = router