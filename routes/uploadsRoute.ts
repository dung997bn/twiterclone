import express from 'express';
import { NextFunction, Request, Response } from 'express';
import path from 'path';

const router = express.Router()

router.get("/images/:path", (req: Request, res: Response, next: NextFunction) => {
    res.sendFile(path.join(__dirname, `../uploads/images/${req.params.path}`))
})
router.get("/cover-images/:path", (req: Request, res: Response, next: NextFunction) => {
    res.sendFile(path.join(__dirname, `../uploads/cover-images/${req.params.path}`))
})
module.exports = router;