import express from 'express';
import { NextFunction, Request, Response } from 'express';
import Chat from '../../schemas/Chat';

const router = express.Router()

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
    let chatName = users.map(u=>u.username).join(", ")
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

module.exports = router;