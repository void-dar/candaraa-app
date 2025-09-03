import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import bcrypt from "bcrypt";
import fetch from "node-fetch";
import prisma from "../database/db.js";


passport.use(
  new LocalStrategy(
    { usernameField: "email",
        passwordField: "password"
     },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return done(null, false, { message: "User not found" });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return done(null, false, { message: "Incorrect password" });
        const userId = user.id;
        const streak = user.streak;
        streak++;
        await prisma.user.update({ where: { id: userId }, data: {streak: streak} });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/secrets",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        
        let user = await prisma.user.findUnique({
          where: { email: profile.emails[0].value },
          include: { authProviders: true },
        });

        if (!user) {
          
          user = await prisma.user.create({
            data: {
              email: profile.emails[0].value,
              username: profile.displayName,
              password: "google",
              
              authProviders: {
                create: {
                  provider: "GOOGLE",
                  providerId: profile.id,
                },
              },
            },
          });
        } else {
          
          const googleProvider = user.authProviders.find(
            (ap) => ap.provider === "GOOGLE"
          );

          if (!googleProvider) {
            await prisma.authProvider.create({
              data: {
                provider: "GOOGLE",
                providerId: profile.id,
                userId: user.id,
              },
            });
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);



passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (jwtPayload, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { id: jwtPayload.sub } });
        done(null, user || false);
      } catch (err) {
        done(err, false);
      }
    }
  )
);


