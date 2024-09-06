const jimp = require("jimp");
const path = require("path");

// Function to generate user profile image based on their username
async function generateUserProfileImage(username) {
  try {
    // Generate a blank canvas
    const rawImage = new jimp(256, 256, "#ffffff");
    const font = await jimp.loadFont(jimp.FONT_SANS_64_BLACK); // Load the font with sans 64

    // Get user's firt letter
    const firstLetter = username.charAt(0).toUpperCase();

    // User's initial letter as profile photo
    rawImage.print(font, 50, 100, firstLetter);

    const fileName = `${username}-profile-${Date.now()}`;
    const profilePhotoFolder = path.join(__dirname, "../../profile_photo");

    const localFilePath = path.join(profilePhotoFolder, fileName);

    //
    await rawImage.writeAsync(localFilePath);

    console.log(`Profile photo generated, saved to disk locally`);
    return localFilePath;
  } catch (error) {
    console.error(`Error generating profile photo`, error);
    throw new Error(`Error generating profile photo`);
  }
}

module.exports = generateUserProfileImage;
