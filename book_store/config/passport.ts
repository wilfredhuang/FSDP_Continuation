import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as FacebookStrategy } from "passport-facebook";
import bcrypt from "bcryptjs";
import { v1 as uuidv1 } from "uuid";
import User from "../models/User"; // your Sequelize model

// ------------------- Local Strategy -------------------
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email: string, password: string, done) => {
      try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
          return done(null, false, { message: "No user found" });
        }

        const isMatch = await bcrypt.compare(password, user.password ?? "");
        if (!isMatch) {
          return done(null, false, { message: "Password incorrect" });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

// ------------------- Facebook Strategy -------------------
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID ?? "",
      clientSecret: process.env.FACEBOOK_APP_SECRET ?? "",
      callbackURL: "/user/auth/facebook/callback",
      profileFields: ["id", "emails", "name", "displayName"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({
          where: { facebookId: profile.id },
        });

        if (existingUser) return done(null, existingUser);

        const newUser = await User.create({
          id: uuidv1(),
          name: profile.displayName ?? null,
          facebookId: profile.id ?? null,
          email: profile.emails?.[0]?.value ?? null, // ✅ undefined → null
          facebookToken: accessToken ?? null,
          isadmin: false,
          confirmed: true,
        });

        return done(null, newUser);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

// ------------------- Serialize / Deserialize -------------------
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findByPk(id);
    return done(null, (user as any) ?? false); // ✅ Safe cast, TS-compliant
  } catch (error) {
    return done(error as Error);
  }
});

export default passport;
