require("dotenv").config();

const fs = require("fs");
const csv = require("csv-parser");
const axios = require("axios");

// ===== CONFIG =====
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// random delay function
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// send message function
async function sendWhatsAppMessage(phone, name) {

	try {
		await axios.post(
			`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
			{
				messaging_product: "whatsapp",
				to: phone,
				type: "template",
				template: {
					name: "hello_world",
					language: {
						code: "en_US",
					},
				},
			},
			{
				headers: {
					Authorization: `Bearer ${ACCESS_TOKEN}`,
					"Content-Type": "application/json",
				},
			},
		);

		console.log(`✅ Sent to ${name}`);
	} catch (err) {
		console.log(`❌ Failed for ${name}`, err.response?.data || err.message);
	}
}

// read CSV and process
async function start() {
	const users = [];

	fs.createReadStream("data.csv")
		.pipe(csv())
		.on("data", (row) => users.push(row))
		.on("end", async () => {
			console.log("Starting sending...");

			for (let i = 0; i < users.length; i++) {
				const user = users[i];

				await sendWhatsAppMessage(user.phone, user.name);

				// delay only if not last user
				if (i < users.length - 1) {
					const randomDelay = Math.floor(Math.random() * 50000) + 1000;
					console.log(`⏳ Waiting ${randomDelay / 1000}s`);
					await delay(randomDelay);
				}
			}

			console.log("🎉 Completed");
		});
}

start();
