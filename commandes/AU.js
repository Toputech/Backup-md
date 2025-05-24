const { zokou } = require("../framework/zokou");
const cron = require("node-cron");
const fs = require("fs");
const axios = require("axios");
const conf = require(__dirname + "/../set");
const translate = require("translate-google"); // Changed here

const SETTINGS_FILE = "./autofact-groups.json";
let autoFactGroups = fs.existsSync(SETTINGS_FILE)
  ? JSON.parse(fs.readFileSync(SETTINGS_FILE))
  : [];

let globalSock = null;

// Helper to send context message
const replyWithContext = async (sock, jid, ms, text) => {
  const quoted = ms ? { quoted: ms } : {};
  await sock.sendMessage(
    jid,
    {
      text,
      contextInfo: {
        externalAdReply: {
          title: "ALONE MD V² FACT MEMORY",
          body: "Group Utility",
          thumbnailUrl: conf.URL || "",
          sourceUrl: "https://github.com/Zokou1/ALONE-MD",
          mediaType: 1,
          renderLargerThumbnail: true,
        },
      },
    },
    quoted
  );
};

// Command to enable/disable autofacts
zokou(
  {
    nomCom: "autofacts",
    categorie: "Group",
    reaction: "🧠",
  },
  async (jid, sock, data) => {
    globalSock = sock;
    const { arg, groupMetadata, ms, isGroup } = data;
    const groupId = isGroup ? groupMetadata?.id : jid;

    if (!arg[0]) return replyWithContext(sock, jid, ms, "Please use 'on' or 'off'.");

    if (arg[0] === "on") {
      if (!autoFactGroups.includes(groupId)) {
        autoFactGroups.push(groupId);
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(autoFactGroups));
        return replyWithContext(sock, jid, ms, "✅ Auto Fact messages enabled.");
      } else {
        return replyWithContext(sock, jid, ms, "Auto Fact is already enabled.");
      }
    }

    if (arg[0] === "off") {
      autoFactGroups = autoFactGroups.filter((id) => id !== groupId);
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(autoFactGroups));
      return replyWithContext(sock, jid, ms, "❌ Auto Fact messages disabled.");
    }

    return replyWithContext(sock, jid, ms, "Invalid argument. Use 'on' or 'off'.");
  }
);

// Updated translation function using translate-google package
async function translateToSwahili(text) {
  try {
    console.log("Translating to Swahili:", text);
    const translated = await translate(text, { from: "en", to: "sw" });
    console.log("Translated successfully:", translated);
    return translated;
  } catch (err) {
    console.error("Translation error:", err);
    return "⚠️ Kiswahili translation failed.";
  }
}

// Scheduled task to send facts
cron.schedule("0 */45 * * * *", async () => {
  if (!globalSock) {
    console.log("No sock connection available yet.");
    return;
  }

  try {
    const res = await axios.get("https://uselessfacts.jsph.pl/random.json?language=en");
    const factEn = res.data.text;

    const factSw = await translateToSwahili(factEn);

    for (const groupId of autoFactGroups) {
      try {
        console.log("Sending fact to group:", groupId);

        await replyWithContext(
          globalSock,
          groupId,
          null,
          `🧠 *Random Fact*\n\n🗣️ *English:*\n${factEn}\n\n🌍 *Kiswahili:*\n${factSw}`
        );
      } catch (err) {
        console.error(`Failed to send fact to ${groupId}:`, err);
      }
    }
  } catch (err) {
    console.error("Fact fetch error:", err.message);
  }
});
