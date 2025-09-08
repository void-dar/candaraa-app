import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import bcrypt from "bcrypt";
import prisma from "../database/db.js";
import { Region } from "../../generated/prisma/index.js";

export function isNewDay(date1, date2) {
    return (
        date1.getFullYear() !== date2.getFullYear() ||
        date1.getMonth() !== date2.getMonth() ||
        date1.getDate() !== date2.getDate()
    );
}

export function isTwoOrMoreDaysApart(date1, date2) {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());

  const diffMs = Math.abs(d1 - d2);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays >= 2;
}

passport.use(
  new LocalStrategy(
    { usernameField: "email",
        passwordField: "password"
     },
    async (email, password, done) => {
      try {
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) return done(null, false, { message: "User not found" });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return done(null, false, { message: "Incorrect password" });
        const userId = user.id;
        let lastSeen = new Date();
        let streak = user.streak;
        if (isNewDay(lastSeen, user.updatedAt)) { 
          streak++;
        }
        if (isTwoOrMoreDaysApart(lastSeen, user.updatedAt)){
          streak = 0
        }
        
        user = await prisma.user.update({ where: { id: userId }, data: {streak: streak},  select: {
            id: true,
            username: true,
            email: true,
            phoneNumber: true,
            isPremium: true,
            isVerified: true,
            region: true,
            role: true,
            level: true,
            points: true,
            coins: true,
            usdt: true,
            streak: true,
            createdAt: true,
            updatedAt: true }});
       
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
      callbackURL: `${process.env.BASE_URL}/auth/google/secrets`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        
        let user = await prisma.user.findUnique({
          where: { email: profile.emails[0].value },
          include: { authProviders: true },
        });
        let lastSeen = new Date();
        let streak = user.streak;
        if (isNewDay(lastSeen, user.updatedAt)) { 
          streak++;
        }
        if (isTwoOrMoreDaysApart(lastSeen, user.updatedAt)){
          streak = 0
        }
         await prisma.user.update({
          where: { email: profile.emails[0].value },
          data: { streak: streak },
        });

        if (!user) {
          
          user = await prisma.user.create({
            data: {
              email: profile.emails[0].value,
              username: profile.displayName,
              password: "google",
              isVerified: true,
              region: Region.AFRICA,
              
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
      secretOrKey: process.env.ACCESS_SECRET,
    },
    async (jwtPayload, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { id: jwtPayload.sub }, select:  {
            id: true,
            username: true,
            email: true,
            phoneNumber: true,
            isPremium: true,
            isVerified: true,
            region: true,
            role: true,
            level: true,
            points: true,
            coins: true,
            usdt: true,
            streak: true,
            createdAt: true,
            updatedAt: true} });
        done(null, user || false);
      } catch (err) {
        done(err, false);
      }
    }
  )
);


