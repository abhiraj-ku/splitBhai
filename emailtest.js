// const dns = require("dns");

// const verifyEmailDomain = (email) => {
//   const domain = email.split("@")[1]; // Extract the domain from the email address
//   return new Promise((resolve, reject) => {
//     dns.resolveMx(domain, (err, addresses) => {
//       if (err || addresses.length === 0) {
//         return resolve(false); // Domain is invalid or has no MX records
//       }
//       resolve(true); // Domain has valid MX records
//     });
//   });
// };

// // Example usage
// verifyEmailDomain("demo@gmail1.com").then((isValid) => {
//   if (isValid) {
//     console.log("Domain has valid MX records.");
//   } else {
//     console.log("Invalid domain or no MX records.");
//   }
// });
const isValidEmailFormat = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  return emailRegex.test(email);
};

// Test the function
console.log(isValidEmailFormat("user@gmail.com")); // Should return true
console.log(isValidEmailFormat("user@yahoo.com")); // Should return false
