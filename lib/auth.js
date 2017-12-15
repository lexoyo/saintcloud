const google = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const launcher = require('browser-launcher3');
const express = require('express')

const port = 8085;

module.exports = function(scopes, keyFile, cbk) {
	if(keyFile) {
		const key = require('../' + keyFile); // FIXME: use Path and check if it is relative or abs
		const jwtClient = new google.auth.JWT(
			key.client_email,
			null,
			key.private_key,
			scopes, // an array of auth scopes
			null
		);
		// set auth as a global default
		google.options({
			auth: jwtClient
		});
		// auth now
		jwtClient.authorize(function (err, tokens) {
			cbk(err);
		});
	}
	else {
		var oauth2Client = new OAuth2(
			process.env.GCLOUD_APP_CLIENT_ID || '893827614875-6q80dpndvr4r8ipt31pg3amr6l5gn14m.apps.googleusercontent.com',
			process.env.GCLOUD_APP_CLIENT_SECRET || '2UWyODtMf7DBXkZjP_moJRWa',
			`http://localhost:${port}`
		);
		// set auth as a global default
		google.options({
			auth: oauth2Client
		});

		const url = oauth2Client.generateAuthUrl({
			scope: scopes,
		});

		authenticate((err, code) => {
			oauth2Client.getToken(code, (err, tokens) => {
				// Now tokens contains an access_token and an optional refresh_token. Save them.
				if (!err) {
					oauth2Client.credentials = tokens;
				}
				cbk(err);
			});
		});

		function waitForToken(cbk) {
			const app = express()
			const server = app.listen(port, () => {
				// register callback url
				app.get('/', (req, res) => {
					if('error' in req.query) {
						res.status(500).send(req.query);
						cbk(req.query);
					} else {
						res.end('<script>window.close();</script>');
						cbk(null, req.query.code);
					}
					server.close();
				})
			});

		}
		function authenticate(cbk) {
			launcher((err, launch) => {
				if ( err ) {
					console.error('Can not open browser for auth', err);
					cbk(err);
					return;
				}
				launch(url, process.env.BROWSER || 'chrome', (err, instance) => {
					if(err) {
						console.error('Can not open auth URL', err);
						cbk(err);
						return;
					}	
					waitForToken((err, code) => {
						instance.stop();
						cbk(err, code);
					});
				});
			});
		}
	}
}

