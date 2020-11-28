import express from 'express';
import { NextFunction, Request, Response } from 'express';
import Post from '../../schemas/Post'
import User from '../../schemas/User';

const router = express.Router()


router.get("/:userId/following", async (req: Request, res: Response, next: NextFunction) => {
    let results: any = await User.findById(req.params.userId)
        .populate("following")
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
    return res.status(200).send(results);
});

router.get("/:userId/followers", async (req: Request, res: Response, next: NextFunction) => {
    let results: any = await User.findById(req.params.userId)
        .populate("followers")
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
    return res.status(200).send(results);
});


router.put("/:userId/follow", async (req: Request, res: Response, next: NextFunction) => {
    let user = req.app.get('user')
    let userId = req.params.userId

    let userFollow: any = await User.findById(userId).catch((error) => {
        return res.status(400).send({ error })
    })
    if (!userFollow)
        return res.status(404)

    let isFollowing = userFollow.followers && userFollow.followers.includes(user._id)
    let option = isFollowing ? '$pull' : '$addToSet'

    //follow/unfollow user like
    await User.findByIdAndUpdate(userId, {
        [option]: { followers: user._id }
    }, { new: true })
        .catch((error) => {
            return res.status(400).send({ error })
        })

    let userData: any = await User.findByIdAndUpdate(user._id, {
        [option]: { following: userId }
    }, { new: true })
        .catch((error) => {
            return res.status(400).send({ error })
        })
    req.app.set('user', {
        ...user,
        likes: userData.likes
    })

    res.status(200).send(userData)
})

module.exports = router;