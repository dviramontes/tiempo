import 'babel-polyfill';
import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import gcal from 'google-calendar';
import has from 'lodash.has';
import cookieParser from 'cookie-parser';
import passportGoogleOAuth from 'passport-google-oauth';
import session from 'express-session';
import cors from 'cors';
import moment from 'moment';
import bunyan from 'bunyan';

import config from './config';

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
  return done(null, profile);
});

app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({ secret: 'FBI_CREDS' }));
app.use(passport.initialize());
app.use(express.static('public'));
app.use(cors());

passport.use(GoogleStrategyConfig);

function fetchCalEventsPromise(accessToken, id, timeMin, timeMax) {
  return new Promise((resolve, reject) => {
    return gcal(accessToken).events.list(id, {
      timeMin,
      timeMax,
    }, (err, eventList) => {
      if (err) return reject(err);
      return resolve(eventList);
    });
  });
}

app.all('/', (req, res) => {
  if (!has(req, 'session.access_token')) return res.redirect('/auth');
  return res.status(200).send(req.session.accessToken);
});

app.all('/calendar/:id/:timeMin/:timeMax', async (req, res) => {
  if (!has(req, 'session.access_token')) return res.redirect('/auth');
  const accessToken = req.session.access_token;
  const { id, timeMin, timeMax } = req.params;
  try {
    const eventList = await fetchCalEventsPromise(accessToken, id, timeMin, timeMax);
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
  res.redirect(`/calendar/${id}/:${yesterday}/:${today}`);
})

app.get('/auth', passport.authenticate('google', { session: false }));

app.get('/auth/callback', passport.authenticate('google', {
  session: false,
  failureRedirect: '/login'
}), (req, res) => {
  req.session.access_token = req.user.accessToken;
  res.redirect('/');
});

app.listen(PORT);