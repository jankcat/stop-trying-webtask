"use latest";

import express from 'express';
import request from 'request';
import Webtask from 'webtask-tools';

const app = express();

app.get('*', (req, res) => {
	// Retrieve and prepare the user's message
	const message = req.query.message || "You Done Messed Up, A-Aron!";
	const saniString = message.toUpperCase();
	
	// ImgFlip API setup
	const imgFlipUsername = req.webtaskContext.secrets.imgFlipUsername || "";
	const imgFlipPassword = req.webtaskContext.secrets.imgFlipPassword || "";
	
	// Generate the meme
	makeImage(imgFlipUsername, imgFlipPassword, saniString, function (err, body) {
		if (body) {
			const img = request.get(body);
			// As soon as we get a response, we copy the headers and status code
			img.on('response', (response) => {
				res.set(response.headers);
				res.status(response.statusCode);
			});
			
			// To reduce the memory footprint, we use streaming again
			img.pipe(res);
		} else if (err) {
			res.json({error: "OOPSIE WOOPSIE!! Uwu We made a fucky wucky!! Here's the deetyweetys: " + err});
		} else {
			res.json({error: "OOPSIE WOOPSIE!! Uwu We made a fucky wucky!!"});
		}
	});
});

function makeImage(username, password, message, callback) {
	
	// Prepare request
	const data = {
		template_id: 56409819,
		username,
		password,
		boxes: [
			{
				text: `STOP TRYING TO MAKE ${message} HAPPEN`,
			},
			{
				text: "IT'S NOT GOING TO HAPPEN",
			},
		],
	};
	
	// Send request to API
	request.post(
		{
			url: "https://api.imgflip.com/caption_image",
			form: data,
		},
		function (err, httpResponse, body) {
			if (err) return callback(err);
			var bodyObj = {};
			try {
				bodyObj = JSON.parse(body);
			} catch (e) {
				return callback(e);
			}
			if (!bodyObj.success) return callback(bodyObj.error_message);
			callback(null, bodyObj.data.url);
		}
	);
}

export default Webtask.fromExpress(app);
