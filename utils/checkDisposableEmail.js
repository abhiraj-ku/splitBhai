const mongoose = require("mongoose");
const disposableEmailModel = require("./disposableEmailModels");
const wildcards = require("disposable-email-domains/wildcard.json");

async function importDomain() {
  try {
    await mongoose.connect("mongodb://localhost:27017/disposabledomain", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // wildcards json array ko loop kro and done
    for (let domain of wildcards) {
      try {
        await disposableEmailModel.create({ domain });
        console.log(`Imported: ${domain}`);
      } catch (error) {
        console.error(`Error importing ${domain}:`, error);
      }
    }

    console.log("All domains imported successfully!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  } finally {
    mongoose.connection.close();
  }
}
module.exports = importDomain;
