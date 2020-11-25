import express from 'express';
import { NextFunction, Request, Response } from 'express';
import Post from '../../schemas/Post'
import User from '../../schemas/User';

const router = express.Router()

router.get("/", (req: Request, res: Response, next: NextFunction) => {
    Post.find()
        .populate("postedBy")
        .sort({ 'createdAt': -1 })
        .then((results: any) => {
            res.status(200).send(results)
        }).catch((error) => {
            console.log(error);
            return res.status(400).send({ error })
        })
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


//like
router.put("/:id/like", async (req: Request, res: Response, next: NextFunction) => {
    let postId = req.params.id
    let user = req.app.get('user')
    if (!user) {
        return res.redirect("/login");
    }
    let userId = user._id

    let isLiked = user.likes && user.likes.includes(postId)

    let option = isLiked ? '$pull' : '$addToSet'

    //Insert user like
    let userData: any = await User.findByIdAndUpdate(userId, {
        [option]: { likes: postId }
    }, { new: true })
        .catch((error) => {
            return res.status(400).send({ error })
        })

    req.app.set('user', {
        ...user,
        likes: userData.likes
    })

    //Insert post like
    let post = await Post.findByIdAndUpdate(postId, {
        [option]: { likes: userId }
    }, { new: true })
        .catch((error) => {
            return res.status(400).send({ error })
        })

    return res.status(200).send({ post })
})


//retweet
router.post("/:id/retweet", async (req: Request, res: Response, next: NextFunction) => {
    let postId = req.params.id
    let user = req.app.get('user')
    if (!user) {
        return res.redirect("/login");
    }
    let userId = user._id

    //Try and delete retweet
    let deletedPost: any = await Post.findOneAndDelete({ postedBy: userId, retweetData: postId })
        .catch((error) => {
            return res.status(400).send({ error })
        })

    let option = deletedPost != null ? '$pull' : '$addToSet'

    let repost = deletedPost

    if (repost == null) {
        repost = await Post.create({ postedBy: userId, retweetData: postId })
            .catch((error) => {
                return res.status(400).send({ error })
            })
    }

    //Insert user retweet
    let userData: any = await User.findByIdAndUpdate(userId, {
        [option]: { retweets: repost._id }
    }, { new: true })
        .catch((error) => {
            return res.status(400).send({ error })
        })

    req.app.set('user', {
        ...user,
        retweets: userData.retweets
    })

    //Insert post like
    let post = await Post.findByIdAndUpdate(postId, {
        [option]: { retweetUsers: userId }
    }, { new: true })
        .catch((error) => {
            return res.status(400).send({ error })
        })
    return res.status(200).send({ post })
})



module.exports = router;