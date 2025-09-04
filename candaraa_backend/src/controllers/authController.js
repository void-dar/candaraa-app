import {config} from "dotenv";
config();
import bcrypt from "bcrypt"
import prisma from "../database/db.js"
import { sendEmail } from "../helpers/mailer.js";


const registerUserWithPassword = async (req, res, next) => {
    const {username, email, password, region, role, phoneNumber} = req.body;
    try{
       const userExists = await prisma.user.findUnique({
            where: {email: email},
            include: { authProviders: true }
        });
        if (userExists && userExists.authProviders.map(p => p.provider).includes("GOOGLE")) {
            res.redirect("/auth/google")
            
        }else if (userExists && userExists.authProviders.map(p => p.provider).includes("PASSWORD")) {
            res.status(400).json({
                success: false,
                message: "User already exists, Please log in"
            })
        }
        let saltRounds = 10; 
        let hashedPassword = await bcrypt.hash(password, saltRounds);

        try {
            const existingUser = await prisma.user.findUnique({
                where: { username: req.body.username }
            });

            if (existingUser) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Username already taken" 
                });
            }

            let newUser = await prisma.user.create({
                data: {
                    username: username,
                    email: email,
                    password: hashedPassword,
                    role: role,
                    region: region,
                    phoneNumber: phoneNumber
                }
            }); 

            req.newUser = newUser

            setImmediate(async () => {
                let url = "http://localhost:3000"
                await sendEmail({
                    to: email,
                    subject: "Verify Your Email",
                    html: `<h3>Hello ${username}</h3>
                            <p>Click below to verify your email:</p>
                            <a href="${url}">Verify Email</a>`,
                });
            })
                req.newUser = newUser;   
            //res.status(200).json({ message: "Verification email sent", newUser });
        
            next()
            
        } catch (error) {
            res.status(400).json({
                success: false,
                message: `Couldn't register user  => ${error}`
            })
        }

    }catch(err){
         res.status(500).json({
                success: false,
                message: `Internal Server Error => ${err}`
            })
    }
    
    
}



export default registerUserWithPassword


