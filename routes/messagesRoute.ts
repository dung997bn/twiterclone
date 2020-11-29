import express from 'express';
import { NextFunction, Request, Response } from 'express';
import Chat from '../schemas/Chat';
import User from '../schemas/User';
import mongoose from 'mongoose';
const router = express.Router()

router.get("/", (req: Request, res: Response, next: NextFunction) => {
    const user = req.app.get('user')
    var payload = {
        pageTitle: 'Inbox',
        userLoggedInClient: JSON.stringify(user),
        userLoggedIn: user
    }
    res.status(200).render("inboxPage", payload);
})

router.get("/new", (req: Request, res: Response, next: NextFunction) => {
    const user = req.app.get('user')
    var payload = {
        pageTitle: 'New message',
        userLoggedInClient: JSON.stringify(user),
        userLoggedIn: user
    }
    res.status(200).render("newMessagePage", payload);
})


router.get("/:chatId", async (req: Request, res: Response, next: NextFunction) => {
    const user = req.app.get('user')
    let userId = req.app.get('user')._id
    let chatId = req.params.chatId
    var isValidId = mongoose.isValidObjectId(chatId);

    let payload: any = {
        pageTitle: 'Chat',
        userLoggedInClient: JSON.stringify(user),
        userLoggedIn: user
    }
    if (!isValidId) {
        payload.errorMessage = "Chat does not exist or you do not have permission to view it.";
        return res.status(200).render("chatPage", payload);
    }

    let chat: any = await Chat.findOne({ _id: chatId, users: { $elemMatch: { $eq: userId } } })
        .populate('users')
        .catch((error) => {
            return res.status(400).send({ error })
        })

    if (chat == null) {
        payload.errorMessage = "Chat does not exist or you do not have permission to view it.";
    }
    else {
        payload.chat = chat;
    }

    res.status(200).render("chatPage", payload);
})

module.exports = router