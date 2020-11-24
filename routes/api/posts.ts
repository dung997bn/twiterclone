import express from 'express';
import { NextFunction, Request, Response } from 'express';
import Post from '../../schemas/Post'

const router = express.Router()

router.get("/", (req: Request, res: Response, next: NextFunction) => {
    if (req.app.get('token'))
        req.app.set('token', '')
    res.redirect("/login");
})

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.content) {
        return res.status(400).send({ error: 'No content to post' })
    }
    let user = req.app.get('user')
    let postData = {
        content: req.body.content,
        pinned: false,
        postedBy: user._id
    }
    Post.create(postData).then(async (data: any) => {
        data = await Post.populate(data, { path: 'postedBy' })
        return res.status(201).send({ data })
    }).catch((error) => {
        return res.status(400).send({ error })
    })
})
module.exports = router;