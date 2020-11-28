import express from 'express';
import { NextFunction, Request, Response } from 'express';
import User from '../schemas/User';

const router = express.Router()

router.get("/", (req, res, next) => {
    const user = req.app.get('user')
    const root = 'http://localhost:3003/'
    var payload = {
        pageTitle: user.username,
        userLoggedInClient: JSON.stringify(user),
        userLoggedIn: user,
        profileUser: user,
        root
    }

    res.status(200).render("profilePage", payload);
})


router.get("/:username", async (req: Request, res: Response, next: NextFunction) => {
    const root = 'http://localhost:3003/'
    const payload: any = await getPayload(req.params.username, req.app.get('user'), root)
    payload.selectedTab = 'post'
    res.status(200).render("profilePage", payload)
})

router.get("/:username/replies", async (req: Request, res: Response, next: NextFunction) => {
    const root = 'http://localhost:3003/'
    const payload: any = await getPayload(req.params.username, req.app.get('user'), root)
    payload.selectedTab = 'replies'
    res.status(200).render("profilePage", payload)
})

router.get("/:username/following", async (req: Request, res: Response, next: NextFunction) => {
    const root = 'http://localhost:3003/'
    const payload: any = await getPayload(req.params.username, req.app.get('user'), root)
    payload.selectedTab = 'following'
    res.status(200).render("followersAndFollowing", payload)
})

router.get("/:username/followers", async (req: Request, res: Response, next: NextFunction) => {
    const root = 'http://localhost:3003/'
    const payload: any = await getPayload(req.params.username, req.app.get('user'), root)
    payload.selectedTab = 'followers'
    res.status(200).render("followersAndFollowing", payload)
})

async function getPayload(username: string, userLoggedInClient: any, root: string) {
    let user: any = await User.findOne({ username: username })
    if (!user) {
        user = await User.findById({ username })
        if (user) {
            return {
                pageTitle: user.username,
                userLoggedInClient: JSON.stringify(userLoggedInClient),
                profileUser: user,
                userLoggedIn: userLoggedInClient,
                root
            }
        } else {
            return {
                pageTitle: 'User not found',
                userLoggedInClient: JSON.stringify(userLoggedInClient),
                userLoggedIn: userLoggedInClient,
                profileUser: null,
                root
            }
        }

    }
    return {
        pageTitle: user.username,
        userLoggedInClient: JSON.stringify(userLoggedInClient),
        userLoggedIn: userLoggedInClient,
        profileUser: user,
        root
    }
}

module.exports = router