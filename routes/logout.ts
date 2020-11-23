import express from 'express';
import { NextFunction, Request, Response } from 'express';


const router = express.Router()

router.get("/", (req: Request, res: Response, next: NextFunction) => {
    if (req.app.get('token'))
        req.app.set('token', '')
    res.redirect("/login");
})
module.exports = router;