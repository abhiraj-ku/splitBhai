const axios = require("axios");
const phone_ver_key = process.env.PHONE_VER_API_KEY;
const email_ver_key = process.env.RAPID_API_KEY;

// Function to verify disposable and valid email
const verifyEmail = async (email) => {
  if (!email_ver_key) {
    throw new Error("Missing email verification API key.");
  }

  const options = {
    method: "GET",
    url: "https://disposable-invalid-email-verifier.p.rapidapi.com/domain/email",
    params: { email },
    headers: {
      "x-rapidapi-key": email_ver_key,
      "x-rapidapi-host": "disposable-invalid-email-verifier.p.rapidapi.com",
    },
  };

  try {
    const request = await axios.request(options);
    return request.data;
  } catch (error) {
    console.error("Error verifying email:", error);
    throw error;
  }
};

// Function to verify phone number
const verifyPhone = async (phone) => {
  if (!phone_ver_key) {
    throw new Error("Missing phone verification API key.");
  }

  if (!phone) {
    throw new Error("Phone number is required.");
  }

  try {
    const api_url = `https://api.phone-validator.net/api/v2/verify?PhoneNumber=${phone}&CountryCode=in&APIKey=${phone_ver_key}`;

    const response = await axios.get(api_url);
    const { status, message } = response.data;

    if (status !== "VALID_CONFIRMED") {
      throw new Error("Invalid phone number, try with another number.");
    }

    return { status, message };
  } catch (error) {
    console.error("Error verifying phone number:", error);
    throw new Error("An error occurred while verifying the phone number.");
  }
};

module.exports = { verifyEmail, verifyPhone };