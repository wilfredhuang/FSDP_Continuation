// config/passport.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import User from "../models/User.js"; // ✅ default import
passport.use(new LocalStrategy({ usernameField: "email", passReqToCallback: false }, async (email, password, done) => {
    try {
        console.log("🔍 LocalStrategy called with:", email, password);
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log("❌ No user found for email:", email);
            return done(null, false, { message: "Email not registered" });
        }
        const passwordHash = user.password ?? "";
        console.log("🧂 DB hash:", passwordHash);
        const isMatch = await bcrypt.compare(password, passwordHash);
        console.log("🧩 Password match?", isMatch);
        if (!isMatch) {
            console.log("❌ Incorrect password");
            return done(null, false, { message: "Incorrect password" });
        }
        console.log("✅ User authenticated:", user.email);
        const expressUser = {
            id: user.id,
            email: user.email ?? null,
            username: user.username ?? undefined,
            role: user.role ?? undefined,
            isadmin: user.isadmin ?? null,
            confirmed: user.confirmed ?? null,
        };
        return done(null, expressUser);
    }
    catch (err) {
        console.log("🔥 Strategy error:", err);
        return done(err);
    }
}));
passport.serializeUser((user, done) => {
    // store just the id in the session
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        if (!user)
            return done(null, false);
        // ✅ Normalize to Express.User again
        const expressUser = {
            id: user.id,
            email: user.email ?? null,
            username: user.username ?? undefined,
            role: user.role ?? undefined,
            isadmin: user.isadmin ?? null,
            confirmed: user.confirmed ?? null,
        };
        done(null, expressUser);
    }
    catch (err) {
        done(err);
    }
});
export default passport;
//# sourceMappingURL=passport.js.map