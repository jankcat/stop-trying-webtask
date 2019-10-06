"use strict";
const request = require("request");

module.exports = function (context, callback) {
	// Retrieve and prepare the user's message
	const message = context.query.message || "You Done Messed Up A-Aron!";
	const saniString = message.toUpperCase();
	
	// ImgFlip API setup
	const imgFlipUsername = context.secrets.imgFlipUsername || "";
	const imgFlipPassword = context.secrets.imgFlipPassword || "";

	// Generate the meme
	getImage(imgFlipUsername, imgFlipPassword, saniString, function (err, body) {
		if (body) {
			callback(null, body);
		} else if (err) {
			callback(null, "OOPSIE WOOPSIE!! Uwu We made a fucky wucky!! Here's the deetyweetys: "+ err);
		} else {
			callback(null, "OOPSIE WOOPSIE!! Uwu We made a fucky wucky!!");
		}
	});
}

function getImage(username, password, message, callback) {
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