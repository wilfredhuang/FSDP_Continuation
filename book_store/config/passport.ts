// config/passport.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import type { Request } from "express";
import User from "../models/User"; // ✅ default import

passport.use(
  new LocalStrategy(
    { usernameField: "email", passReqToCallback: false },
    async (email: string, password: string, done) => {
      try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
          return done(null, false, { message: "Email not registered" });
        }

        // ✅ user.password can be null in the model — coerce safely
        const passwordHash = user.password ?? "";
        const isMatch = await bcrypt.compare(password, passwordHash);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password" });
        }

        // ✅ Map Sequelize model → Express.User (types/global.d.ts)
        const expressUser: Express.User = {
          id: user.id,
          email: user.email ?? null,
          username: (user as any).username ?? undefined,
          role: (user as any).role ?? undefined,
          isadmin: (user as any).isadmin ?? null,
          confirmed: (user as any).confirmed ?? null,
        };

        return done(null, expressUser);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  // store just the id in the session
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findByPk(id);
    if (!user) return done(null, false);

    // ✅ Normalize to Express.User again
    const expressUser: Express.User = {
      id: user.id,
      email: user.email ?? null,
      username: (user as any).username ?? undefined,
      role: (user as any).role ?? undefined,
      isadmin: (user as any).isadmin ?? null,
      confirmed: (user as any).confirmed ?? null,
    };

    done(null, expressUser);
  } catch (err) {
    done(err as Error);
  }
});

export default passport;
