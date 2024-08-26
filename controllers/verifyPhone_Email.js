const axios = require("axios");

const key = process.env.PHONE_VER_API_KEY;
console.log(key);

async function verifyPhone(phone) {
  if (!phone) {
    throw new Error(`Phone number is required`);
  }

  try {
    const api_url = `https://api.phone-validator.net/api/v2/verify?PhoneNumber=${phone}&CountryCode=in&APIKey=${key}`;

    const response = await axios.get(api_url);
    console.log(response.data);

    const { status, message } = response.data; // Destructuring for clarity

    if (status != "VALID_CONFIRMED") {
      throw new Error(`Invalid Phone Number, Try with another number`);
    }

    return { status, message };
  } catch (error) {
    console.error(`Error verifying phone number:`, error);
    throw new Error("An error occurred while verifying the phone number.");
  }
}

// module.exports = verifyPhone;

verifyPhone(7525984216);
