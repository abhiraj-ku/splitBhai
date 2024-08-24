const axios = require("axios");

const key = process.env.PHONE_VER_API_KEY;

async function verifyPhone(phone) {
  if (!phone) {
    throw new Error(`Phone number is required`);
  }

  try {
    const api_url = `https://api.phone-validator.net/api/v2/verify?PhoneNumber=${phone}&CountryCode=in&APIKey=${key}`;

    const response = await axios.get(api_url);

    const status = response.data.status;
    switch (status) {
      case "VALID_CONFIRMED":
        return { valid: true, confirmed: true };
      case "VALID_UNCONFIRMED":
        return { valid: true, confirmed: false };
      case "INVALID":
        return { valid: false, confirmed: false };
      case "DELAYED":
        return {
          valid: null,
          confirmed: null,
          message: "Verification is delayed.",
        };
      case "RATE_LIMIT_EXCEEDED":
        throw new Error("API rate limit exceeded.");
      case "API_KEY_INVALID_OR_DEPLETED":
        throw new Error("API key is invalid or depleted.");
      default:
        throw new Error("Unknown status received from the API.");
    }
  } catch (error) {
    console.error(`Error verifying phone number:`, error);
    throw new Error("An error occurred while verifying the phone number.");
  }
}

module.exports = verifyPhone;
