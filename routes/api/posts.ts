import { assert } from 'console';
import express from 'express';
import { NextFunction, Request, Response } from 'express';
import Post from '../../schemas/Post'
import User from '../../schemas/User';

const router = express.Router()

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    let results = await getPosts({})
    res.status(200).send(results)
})

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    let postId = req.params.id
    let postData: any = await getPosts({ _id: postId })

    let results = {
        postData: postData[0],
        replyTo: null,
        replies: null as any
    }
    if (postData[0].replyTo)
        results.replyTo = postData[0].replyTo

    results.replies = await getPosts({ replyTo: postId })

    res.status(200).send(results)
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

//Comment

router.post("/comment/:postId", async (req: Request, res: Response, next: NextFunction) => {
    let postId = req.params.postId
    let user = req.app.get('user')
    if (!user) {
        return res.redirect("/login");
    }
    let userId = user._id

    let data = {
        postedBy: userId,
        content: req.body.content,
        pinned: false,
        replyTo: postId
    }

    //Insert post comment
    let post = await Post.create(data)
        .catch((error) => {
            return res.status(400).send({ error })
        })

    return res.status(200).send({ post })
})


async function getPosts(filter: any): Promise<typeof Post[]> {
    let results: any = await Post.find(filter)
        .populate("postedBy")
        .populate('retweetData')
        .populate('replyTo')
        .sort({ 'createdAt': -1 })
        .catch((error) => {
            console.log(error)
        })
    await User.populate(results, { path: 'replyTo.postedBy' })
    return await User.populate(results, { path: 'retweetData.postedBy' })
}

module.exports = router;