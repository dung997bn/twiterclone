import express from 'express';
import { NextFunction, Request, Response } from 'express';
import User from '../schemas/User'
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken'
import Config from '../config';

const router = express.Router()
const config = new Config()

router.get("/", (req: any, res: Response, next: NextFunction) => {
    res.status(200).render("register")
})

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    let firstName = req.body.firstName.trim();
    let lastName = req.body.lastName.trim();
    let username = req.body.username.trim();
    let email = req.body.email.trim();
    let password = req.body.password;

    let payload = req.body;

    if (firstName && lastName && username && email && password) {
        let user: any = await User.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        })
            .catch((error) => {
                console.log(error);
                payload.errorMessage = "Something went wrong.";
                res.status(200).render("register", payload);
            });

        if (user == null) {
            // No user found
            var data = req.body;
            data.password = await bcrypt.hash(password, 10);

            User.create(data)
                .then((userData :any) => {
                    let payloadSignedIn = {
                        email: userData.email,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        username: userData.username,
                        _id: userData.id
                    }

                    jsonwebtoken.sign(payloadSignedIn, config.getSecret(), { expiresIn: 3600 * 60 * 60 },
                        (err, token) => {
                            if (err) {
                                console.log(err);
                                return
                            }
                            req.app.set('token', token)

                            return res.redirect("/");
                        }
                    );
                })
        }
        else {
            // User found
            if (email == user.email) {
                payload.errorMessage = "Email already in use.";
            }
            else {
                payload.errorMessage = "Username already in use.";
            }
            res.status(200).render("register", payload);
        }
    }
    else {
        payload.errorMessage = "Make sure each field has a valid value.";
        res.status(200).render("register", payload);
    }
})

module.exports = router 