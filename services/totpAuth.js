const speakeasy = require("speakeasy");
const fs = require("fs");
const qrcode = require("qrcode");

// Generate a secret
const secret = speakeasy.generateSecret({
  length: 20,
  name: "MyApp",
  issuer: "MyCompany",
});

// Generate a URL for the QR code (for Google Authenticator)
const otpauthUrl = secret.otpauth_url;

// Generate QR code as a data URL
qrcode.toDataURL(otpauthUrl, { width: 300 }, (err, url) => {
  if (err) {
    console.error("Failed to generate QR code:", err);
  } else {
    // HTML content with embedded QR code and OTP input
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QR Code</title>
  <style>
    body {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background-color: #f0f0f0;
      font-family: Arial, sans-serif;
    }
    .container {
      text-align: center;
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    img {
      width: 300px; /* Adjust width as needed */
      height: 300px; /* Adjust height as needed */
    }
    h1 {
      font-size: 24px;
      color: #333;
    }
    input {
      margin-top: 20px;
      padding: 10px;
      font-size: 16px;
      border: 1px solid #ccc;
      border-radius: 4px;
      width: 80%;
      max-width: 400px;
    }
    button {
      margin-top: 10px;
      padding: 10px 20px;
      font-size: 16px;
      color: #fff;
      background-color: #007bff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background-color: #0056b3;
    }
    .message {
      margin-top: 20px;
      font-size: 18px;
      color: #d9534f;
    }
    .message.success {
      color: #5bc0de;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Scan this QR code with Google Authenticator or any TOTP app:</h1>
    <img src="${url}" alt="QR Code">
    <input type="text" id="otpInput" placeholder="Enter your OTP">
    <button onclick="verifyOTP()">Verify OTP</button>
    <div id="message" class="message"></div>
  </div>
  <script>
    function verifyOTP() {
      const secret = "${secret.base32}";
      const userProvidedCode = document.getElementById("otpInput").value;
      
      // Send request to server for OTP verification (replace this with actual server request)
      fetch('/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ secret, token: userProvidedCode })
      })
      .then(response => response.json())
      .then(data => {
        const messageElement = document.getElementById("message");
        if (data.success) {
          messageElement.textContent = "Code verified successfully!";
          messageElement.className = "message success";
        } else {
          messageElement.textContent = "Incorrect code. Try again.";
          messageElement.className = "message";
        }
      })
      .catch(error => {
        console.error('Error:', error);
        const messageElement = document.getElementById("message");
        messageElement.textContent = "An error occurred. Please try again.";
        messageElement.className = "message";
      });
    }
  </script>
</body>
</html>
    `;

    // Write HTML content to a file
    fs.writeFile("qrcode.html", htmlContent, (err) => {
      if (err) {
        console.error("Failed to write HTML file:", err);
      } else {
        console.log("QR code HTML file created: qrcode.html");
      }
    });
  }
});
