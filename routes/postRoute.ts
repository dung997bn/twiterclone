import express from 'express';
import { NextFunction, Request, Response } from 'express';

const router = express.Router()

router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
    const payload = {
        userLoggedInClient: JSON.stringify(req.app.get('user')),
        postId: req.params.id
    }
    res.status(200).render("postPage", payload)
})

module.exports = router