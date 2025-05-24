const { zokou } = require("../framework/zokou");
const cron = require("node-cron");
const fs = require("fs");
const axios = require("axios");
const translate = require("translate-google");
const conf = require(__dirname + "/../set");

const SETTINGS_FILE = "./autofact-groups.json";
let autoFactGroups = fs.existsSync(SETTINGS_FILE)
  ? JSON.parse(fs.readFileSync(SETTINGS_FILE))
  : [];

let globalSock = null; // used by cron job

// Helper function to reply with context
const replyWithContext = async (sock, jid, ms, text) => {
  await sock.sendMessage(
    jid,
    {
      text,
      quoted: ms || undefined,
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
    }
  );
};

// Command: /autofacts on|off
zokou(
  {
    nomCom: "autofacts",
    categorie: "Group",
    reaction: "🧠",
  },
  async (jid, sock, data) => {
    try {
      console.log("✅ /autofacts command received");

      globalSock = sock;
      const { arg, groupMetadata, ms, isGroup } = data;
      const groupId = isGroup ? groupMetadata?.id : jid;

      if (!arg[0]) {
        return replyWithContext(sock, jid, ms, "Please use 'on' or 'off'.");
      }

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
        autoFactGroups = autoFactGroups.filter(id => id !== groupId);
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(autoFactGroups));
        return replyWithContext(sock, jid, ms, "❌ Auto Fact messages disabled.");
      }

      return replyWithContext(sock, jid, ms, "Invalid argument. Use 'on' or 'off'.");
    } catch (err) {
      console.error("❌ autofacts command error:", err);
      return sock.sendMessage(jid, { text: "⚠️ Error handling /autofacts command." });
    }
  }
);

// Scheduled Task - Every 5 minutes
cron.schedule("0 */5 * * * *", async () => {
  if (!globalSock) {
    console.log("No sock connection available yet.");
    return;
  }

  try {
    const res = await axios.get("https://uselessfacts.jsph.pl/random.json?language=en");
    const factEn = res.data.text;

    // Translate to Swahili
    let factSw = factEn;
    try {
      factSw = await translate(factEn, { from: "en", to: "sw" });
    } catch (err) {
      console.error("Translation error:", err.message);
    }

    for (const groupId of autoFactGroups) {
      try {
        await replyWithContext(
          globalSock,
          groupId,
          null,
          `🧠 *Random Fact*\n\n🗣️ *English:*\n${factEn}\n\n🌍 *Kiswahili:*\n${factSw}`
        );
      } catch (err) {
        console.error(`❌ Failed to send to ${groupId}:`, err.message);
      }
    }
  } catch (err) {
    console.error("❌ Error fetching fact:", err.message);
  }
});
