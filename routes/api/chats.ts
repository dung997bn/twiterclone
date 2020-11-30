import express from 'express';
import { NextFunction, Request, Response } from 'express';
import Chat from '../../schemas/Chat';

const router = express.Router()

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    let user = req.app.get('user')
    if (!user) {
        return res.redirect("/login");
    }

    await Chat.find({ users: { $elemMatch: { $eq: user._id } } })
        .populate("users")
        .populate("latestMessage")
        .sort({ updatedAt: -1 }).then(async (data) => {
            data = await Chat.populate(data, { path: 'latestMessage.sender' })
            res.status(200).send(data)
        })
        .catch((error) => {
            return res.status(400).send({ error })
        })
})

router.get("/:chatId", async (req: Request, res: Response, next: NextFunction) => {
    let user = req.app.get('user')
    if (!user) {
        return res.redirect("/login");
    }

    let results: any = await Chat.findOne({ _id: req.params.chatId, users: { $elemMatch: { $eq: user._id } } })
        .populate("users")
        .sort({ updatedAt: -1 })
        .catch((error) => {
            return res.status(400).send({ error })
        })

    res.status(200).send(results)
})

router.post("/", async (req: Request, res: Response, next: NextFunction) => {

    let user = req.app.get('user')
    if (!user) {
        return res.redirect("/login");
    }

    if (!req.body.users) {
        return res.status(400).send({ error: "Not have any users to create chat" })
    }
    let users: any[] = JSON.parse(req.body.users)
    users.push({
        _id: user._id,
        username: user.username
    })
    let chatName = users.map(u => u.username).join(", ")
    let userIds = users.map((u) => u._id)

    let chatData = {
        chatName,
        isGroupChat: true,
        users: userIds,
    }

    let result: any = await Chat.create(chatData)
        .catch((error) => {
            return res.status(400).send({ error })
        })

    res.status(200).send(result)
})

router.put("/:chatId", async (req: Request, res: Response, next: NextFunction) => {
    let user = req.app.get('user')
    if (!user) {
        return res.redirect("/login");
    }
    let results: any = await Chat.findByIdAndUpdate(req.params.chatId, req.body)
        .catch((error) => {
            return res.status(400).send({ error })
        })
    res.status(200).send(results)
})

module.exports = router;