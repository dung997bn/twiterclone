import express from 'express';
import { NextFunction, Request, Response } from 'express';

const router = express.Router()

router.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).render("login")
})

module.exports = router