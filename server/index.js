import 'babel-polyfill';
import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import has from 'lodash.has';
import cookieParser from 'cookie-parser';
import passportGoogleOAuth from 'passport-google-oauth';
import session from 'express-session';
import cors from 'cors';
import moment from 'moment';
import bunyan from 'bunyan';
import refresh from 'passport-oauth2-refresh';

import config from './config';
import fetchCalendarEvents from './fetchCalendarEvents';

let cacheRefreshToken = null; // TODO: persist this somewhere between restarts

const log = bunyan.createLogger({ name: 'tiempo' });

const app = express();
const GoogleStrategy = passportGoogleOAuth.OAuth2Strategy;
const PORT = 4000;
const scope = ['openid', 'email', 'https://www.googleapis.com/auth/calendar'];

const GoogleStrategyConfig = new GoogleStrategy({
  clientID: config.client_id,
  clientSecret: config.client_secret,
  callbackURL: `http://localhost:${PORT}/auth/callback`,
  scope,
}, (accessToken, refreshToken, profile, done) => {
  profile.accessToken = accessToken;
  profile.refreshToken = refreshToken;
  return done(null, profile);
});

app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({ secret: 'FBI_CREDS' }));
app.use(passport.initialize());
app.use(cors());

passport.use(GoogleStrategyConfig);
refresh.use(GoogleStrategyConfig);

app.all('/', (req, res) => {
  if (!has(req, 'session.access_token'))  {
    if (cacheRefreshToken) {
      refresh.requestNewAccessToken('googleapis', cacheRefreshToken, (err, accessToken, refreshToken) => {
        req.session.accessToken = accessToken;
        cacheRefreshToken = refreshToken;
        return res.status(200).send(req.session.accessToken);
      });
    }
    return res.redirect('/auth');
  }
  return res.status(200).send(req.session.accessToken);
});

app.all('/calendar/:id/:timeMin/:timeMax', async (req, res) => {
  if (!has(req, 'session.access_token')) return res.redirect('/auth');
  const { accessToken, refreshToken } = req.session.access_token;
  const { id, timeMin, timeMax } = req.params;
  cacheRefreshToken = refreshToken;
  try {
    const eventList = await fetchCalendarEvents(accessToken, id, timeMin, timeMax);
    return res.status(200).send(eventList);
  } catch (err) {
    log.error(err.message);
    return res.status(500).send(err);
  }
});

app.get('/today/:id', (req, res) => {
  const { id } = req.params;
  const today = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DDTHH:mm:ssZ');
  res.redirect(`/calendar/${id}/${yesterday}/${today}`);
})

app.get('/auth', passport.authenticate('google', { session: false, accessType: 'offline' }));

app.get('/auth/callback', passport.authenticate('google', {
  session: false,
  failureRedirect: '/login'
}), (req, res) => {
  req.session.access_token = req.user.accessToken;
  req.session.refresh_token = req.user.refreshToken;
  res.redirect('/');
});

app.listen(PORT);

export default app;