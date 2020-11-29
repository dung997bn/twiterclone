import express from 'express';
import { NextFunction, Request, Response } from 'express';

const router = express.Router()

router.get("/", (req: Request, res: Response, next: NextFunction) => {
    let user = req.app.get('user')
    if (!user) {
        return res.redirect("/login");
    }
    const payload = createPayload(user)
    payload.selectedTab = 'posts'
    return res.status(200).render("searchPage", payload)
})

router.get("/:selectedTab", (req: Request, res: Response, next: NextFunction) => {
    let user = req.app.get('user')
    if (!user) {
        return res.redirect("/login");
    }
    const payload = createPayload(user)
    payload.selectedTab = req.params.selectedTab
    res.status(200).render("searchPage", payload)
})


function createPayload(user: any) {
    return {
        pageTitle: 'Search',
        userLoggedInClient: JSON.stringify(user),
        userLoggedIn: user,
    } as any
}

module.exports = router