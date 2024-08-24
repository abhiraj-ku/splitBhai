const axios = require("axios");

// function to verify disposable and valid email
const verifyEmail = async (email) => {
  const options = {
    method: "GET",
    url: "https://disposable-invalid-email-verifier.p.rapidapi.com/domain/email",
    params: { email },
    headers: {
      "x-rapidapi-key": process.env.RAPID_API_KEY,
      "x-rapidapi-host": "disposable-invalid-email-verifier.p.rapidapi.com",
    },
  };

  try {
    const request = await axios.request(options);
    console.log(request.data);
  } catch (error) {
    console.error(`Error verifying email`, error);
    throw error;
  }
};

module.exports = verifyEmail;