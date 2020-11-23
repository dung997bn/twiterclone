import { NextFunction, Request, Response } from 'express'
import jsonwebtoken from 'jsonwebtoken'
import Config from './config';

const config = new Config()
export function requireLogin(req: Request, res: Response, next: NextFunction) {

    let token = req.app.get('token')
    if (token) {
        jsonwebtoken.verify(token, config.getSecret(), (err: any, decoded: any) => {
            if (decoded.email && decoded._id) {
                req.app.set('user', decoded)
                return next()
            }
            return res.redirect("/login")
        });

    } else {
        return res.redirect("/login")
    }
}