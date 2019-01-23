import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { REPL_MODE_SLOPPY } from 'repl';

//   Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
export const getGoogleStrategy = (models) => new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://fcaa837f.ngrok.io/auth/google/callback"
},
    async (accessToken, refreshToken, profile, done) => {
        //2 use cases: first time login and already existing user
        console.log(`Acess token: ${accessToken}; refresh token: ${refreshToken}`);
        const { id, displayName } = profile;
        const googleUsers = await models.GoogleAuth.findAll({ limit: 1, where: { googleId: id } });

        if (!(googleUsers && googleUsers.length)) {
            const user = await models.User.create();
            await models.GoogleAuth.create({
                googleId: id,
                displayName,
                userId: user.id
            });
        }

        done(null, {});
    }
);
