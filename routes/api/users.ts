import express from 'express';
import { NextFunction, Request, Response } from 'express';
import User from '../../schemas/User';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
const router = express.Router()

let upload = multer({
    dest: "uploads/"
})

router.get("/page/search", async (req: Request, res: Response, next: NextFunction) => {
    let searchObj = req.query
    if (searchObj.search) {
        searchObj = {
            $or: [
                { firstName: { $regex: searchObj.search, $options: "i" } },
                { lastName: { $regex: searchObj.search, $options: "i" } },
                { username: { $regex: searchObj.search, $options: "i" } },
                { email: { $regex: searchObj.search, $options: "i" } },
            ]
        }
    }
    delete searchObj.search

    let results: any = await User.find(searchObj)
        .populate("following")
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
    return res.status(200).send(results);
});

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

router.post("/profilePicture", upload.single("croppedImage"), async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
        console.log('No file here');
        return res.status(400)
    }
    let filePath = `/uploads/images/${req.file.filename}.png`
    let tempPath = req.file.path
    let targetPath = path.join(__dirname, `../../${filePath}`)
    fs.rename(tempPath, targetPath, async (error) => {
        if (error) {
            console.log(error);
            return res.status(400)
        }
        //Update to database
        let user = req.app.get('user')
        let userUpdated = await User.findByIdAndUpdate(user._id, { profilePic: filePath }, { new: true })
        req.app.set('user', userUpdated)
    })
    return res.status(200)
});

router.post("/coverPicture", upload.single("croppedImage"), async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
        console.log('No file here');
        return res.status(400)
    }
    let filePath = `/uploads/cover-images/${req.file.filename}.png`
    let tempPath = req.file.path
    let targetPath = path.join(__dirname, `../../${filePath}`)
    fs.rename(tempPath, targetPath, async (error) => {
        if (error) {
            console.log(error);
            return res.status(400)
        }
        //Update to database
        let user = req.app.get('user')
        let userUpdated = await User.findByIdAndUpdate(user._id, { coverPhoto: filePath }, { new: true })
        req.app.set('user', userUpdated)
    })
    return res.status(200)
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