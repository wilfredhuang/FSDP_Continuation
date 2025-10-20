// config/passport.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import type { Request } from "express";
import User from "../models/User.js";

// ------------------------------------------------------------
// LOCAL STRATEGY
// ------------------------------------------------------------
passport.use(
  new LocalStrategy(
    { usernameField: "email", passReqToCallback: false },
    async (email: string, password: string, done) => {
      try {
        console.log("🔍 LocalStrategy called with:", email, password);

        const user = await User.findOne({ where: { email } });
        if (!user) {
          console.log("❌ No user found for email:", email);
          return done(null, false, { message: "Email not registered" });
        }

        const passwordHash = user.password ?? "";
        const isMatch = await bcrypt.compare(password, passwordHash);
        if (!isMatch) {
          console.log("❌ Incorrect password");
          return done(null, false, { message: "Incorrect password" });
        }

        console.log("✅ User authenticated:", user.email);

        // ✅ Normalize user to Express.User (convert id to string)
        const expressUser: Express.User = {
          id: String(user.id), // 🔧 Cast number → string
          email: user.email ?? null,
          username: (user as any).username ?? undefined,
          role: (user as any).role ?? undefined,
          isadmin: (user as any).isadmin ?? null,
          confirmed: (user as any).confirmed ?? null,
        };

        return done(null, expressUser);
      } catch (err) {
        console.error("🔥 Strategy error:", err);
        return done(err as Error);
      }
    },
  ),
);

// ------------------------------------------------------------
// SESSION HANDLING
// ------------------------------------------------------------
passport.serializeUser((user: Express.User, done) => {
  // ✅ Always store string id in session
  done(null, String(user.id));
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findByPk(Number(id)); // 🔧 Convert back to number for DB lookup
    if (!user) return done(null, false);

    const expressUser: Express.User = {
      id: String(user.id),
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
