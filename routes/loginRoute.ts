import express from 'express';
import { NextFunction, Request, Response } from 'express';
import User from '../schemas/User'
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken'
import Config from '../config';

const config = new Config()
const router = express.Router()

router.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).render("login")
})

router.post("/", async (req: Request, res: Response, next: NextFunction) => {

    let payload = req.body;
    let account = req.body.logUsername

    if (req.body.logUsername && req.body.logPassword) {
        let user: any = await User.findOne({
            $or: [
                { username: account },
                { email: account }
            ]
        }).catch((error) => {
            console.log(error);
            payload.errorMessage = "Something went wrong.";
            res.status(200).render("login", payload);
        });

        if (user != null) {
            var result = await bcrypt.compare(req.body.logPassword, user.password);

            if (result === true) {
                let payloadSignedIn = {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    profilePic: user.profilePic,
                    coverPhoto: user.coverPhoto,
                    likes: user.likes,
                    retweets: user.retweets,
                    following: user.following,
                    followers: user.followers,
                    _id: user.id
                }

                jsonwebtoken.sign(payloadSignedIn, config.getSecret(), { expiresIn: 3600 * 60 * 60 },
                    (err, token) => {
                        if (err) {
                            console.log(err);
                            payload.errorMessage = "Failed to generate token. Please try again.";
                            return res.status(200).render("login", payload);
                        }
                        req.app.set('token', token)
                        return res.redirect("/");
                    }
                );
            }
        } else {
            payload.errorMessage = "Login credentials incorrect.";
            return res.status(200).render("login", payload);
        }

    } else {
        payload.errorMessage = "Make sure each field has a valid value.";
        res.status(200).render("login");
    }
})

module.exports = router