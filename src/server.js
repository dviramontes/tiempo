import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import gcal from 'google-calendar';
import has from 'lodash.has';
import cookieParser from 'cookie-parser';
import passportGoogleOAuth from 'passport-google-oauth';
import session from 'express-session';

import config from './config';

const app = express();
const GoogleStrategy = passportGoogleOAuth.OAuth2Strategy;

app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({ secret: 'FBI_CREDS' }));
app.use(passport.initialize());
app.use(express.static('public'));

const PORT = 4000;
const scope = ['openid', 'email', 'https://www.googleapis.com/auth/calendar'];

const GoogleStrategyConfig = new GoogleStrategy({
    clientID: config.client_id,
    clientSecret: config.client_secret,
    callbackURL: `http://localhost:${PORT}/auth/callback`,
    scope,
}, (accessToken, refreshToken, profile, done) => {
    profile.accessToken = accessToken;
    return done(null, profile);
});

passport.use(GoogleStrategyConfig);

app.all('/', (req, res) => {
    if (!has(req, 'session.access_token')) return res.redirect('/auth');
    return res.status(200).send(req.session.accessToken);
});

app.all('/calendar/:id', (req, res) => {
    if (!has(req, 'session.access_token')) return res.redirect('/auth');
    const accessToken = req.session.access_token;
    gcal(accessToken).calendarList.list((err, calendarList) => {
        if (err) return res.status(500).send(err);
        const calendarId = req.params.id;
        gcal(accessToken).events.list(calendarId, (err, eventList) => {
            return res.status(200).send(eventList);
        });
    });
});

app.get('/auth', passport.authenticate('google', { session: false }));

app.get('/auth/callback',
    passport.authenticate('google',
        { session: false, failureRedirect: '/login' }),
    (req, res) => {
        req.session.access_token = req.user.accessToken;
        res.redirect('/');
    });

app.listen(PORT);