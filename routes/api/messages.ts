import express from 'express';
import { NextFunction, Request, Response } from 'express';
import Chat from '../../schemas/Chat';
import Message from '../../schemas/Message';


const router = express.Router()

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    let user = req.app.get('user')
    if (!user) {
        return res.redirect("/login");
    }

    let chatId = req.body.chatId
    let content = req.body.content

    if (!content || !chatId) {
        console.log("Invalid data passed into request");
        res.status(400)
    }

    let newMessage = {
        sender: user._id,
        content: content,
        chat: chatId
    }

    await Message.create(newMessage).then(async (message) => {
        message = await Message.populate(message, { path: 'sender' })
        message = await message.populate('chat').execPopulate()

        await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id })
            .catch((error) => {
                console.log(error);
                return res.status(400).send({ error })
            })
        res.status(201).send(message)
    }).catch((error) => {
        console.log(error);
        return res.status(400).send({ error })
    })
})

module.exports = router;