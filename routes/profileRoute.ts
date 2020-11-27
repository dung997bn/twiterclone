import express from 'express';
import { NextFunction, Request, Response } from 'express';
import User from '../schemas/User';

const router = express.Router()

router.get("/", (req, res, next) => {
    const user = req.app.get('user')
    const root='http://localhost:3003/'
    var payload = {
        pageTitle: user.username,
        userLoggedInClient: JSON.stringify(user),
        profileUser: user,
        root
    }

    res.status(200).render("profilePage", payload);
})


router.get("/:username",async (req: Request, res: Response, next: NextFunction) => {
    const root='http://localhost:3003/'
    const payload =await getPayload(req.params.username, req.app.get('user'),root)
    res.status(200).render("profilePage", payload)
})

async function getPayload(username: string, userLoggedInClient: any,root:string) {
    let user: any = await User.findOne({ username: username })
    if (!user) {
        user = await User.findById({ username })
        if (user) {
            return {
                pageTitle: user.username,
                userLoggedInClient: JSON.stringify(userLoggedInClient),
                profileUser: user,
                root
            }
        } else {
            return {
                pageTitle: 'User not found',
                userLoggedInClient: JSON.stringify(userLoggedInClient),
                profileUser: null,
                root
            }
        }

    }
    return {
        pageTitle: user.username,
        userLoggedInClient: JSON.stringify(userLoggedInClient),
        profileUser: user,
        root
    }
}

module.exports = router