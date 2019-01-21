import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';

//   Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
export const getGoogleStrategy = ({User}) => new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://fcaa837f.ngrok.io/auth/google/callback"
},
    (accessToken, refreshToken, profile, done) => {
        // User.findOrCreate({ googleId: profile.id }, function (err, user) {
        //     return done(err, user);
        // });
        console.log('PROFILE: ', profile);
        done(null, profile);
    }
);
