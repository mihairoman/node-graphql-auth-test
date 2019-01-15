import GoogleStrategy from 'passport-google';

export const getGoogleStrategy = () => new GoogleStrategy({
    returnURL: 'http://localhost:3000/auth/google/return',
    realm: 'http://localhost:3000/'
},
    (identifier, done) => {
        User.findByOpenID({ openId: identifier }, (err, user) => {
            return done(err, user);
        });
    }
);

export const authGoogle = (app, passport) => app.get('/auth/google',
    passport.authenticate('google'),
    function (req, res) {
        // The request will be redirected to Google for authentication, so
        // this function will not be called.
    });

// app.get('/auth/google/callback',
//     passport.authenticate('google', { failureRedirect: '/login' }),
//     function (req, res) {
//         // Successful authentication, redirect home.
//         res.redirect('/');
//     });