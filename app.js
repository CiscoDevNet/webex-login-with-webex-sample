const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Issuer, Strategy, custom } = require('openid-client');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.set('view engine', 'pug');
app.set('trust proxy', true);

app.use(session({
    secret: "a unique secret",
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => { done(null, user) });
passport.deserializeUser((user, done) => { done(null, user) });

const issuer = new Issuer({
    issuer: 'https://idbroker.webex.com/idb',
    authorization_endpoint: 'https://webexapis.com/v1/authorize',
    token_endpoint: 'https://webexapis.com/v1/access_token',
    userinfo_endpoint: 'https://webexapis.com/v1/userinfo',
    jwks_uri: 'https://webexapis.com/v1/verification',
});

const client = new issuer.Client({
    client_id: process.env.WEBEX_CLIENT_ID,
    client_secret: process.env.WEBEX_CLIENT_SECRET,
    redirect_uris: [process.env.APP_REDIRECT_URL],
});

//Increase openid-client request timeout to 10 sec (default 3.5)
custom.setHttpOptionsDefaults({
    timeout: 10000,
  });

passport.use('oidc', new Strategy({
    client,
    params: { scope: 'openid email spark:people_read' },
}, async (tokenset, userinfo, done) => {
    if (userinfo.email && userinfo.email !== process.env.APP_AUTHORIZED_USER) {
        return done(`Access denied`, null);
    }
    return done(null, { tokenset: tokenset, userinfo: userinfo });
}));

app.get('/login', passport.authenticate('oidc'));

app.get('/callback', passport.authenticate('oidc', {
    successRedirect: '/',
    failWithError: true
}));

const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) { return next() }
    res.redirect("/login")
}

app.get('/', checkAuthenticated, async (req, res) => {
    const user = req.session.passport.user;
    const response = await axios.get('https://webexapis.com/v1/people/me', {
        headers: { Authorization: `Bearer ${user.tokenset.access_token}` },
        validateStatus: (status) => { return [200, 403].includes(status) }
    });
    webexDisplayName = (response.status == 200) ? response.data.displayName : '(403 Forbidden)';
    res.render('index', {
        loggedIn: req.isAuthenticated,
        webexAccessToken: user.tokenset.access_token,
        userInfoEmail: user.userinfo.email ? user.userinfo.email : '(403) Forbidden',
        webexDisplayName: webexDisplayName
    });
});

app.listen(process.env.APP_PORT, () => {
    console.log(`Example app ready at https://localhost`)
});