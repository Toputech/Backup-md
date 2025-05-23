const { zokou } = require("../framework/zokou");
const cron = require("node-cron");
const fs = require("fs");
const axios = require("axios");
const conf = require(__dirname + "/../set");

const SETTINGS_FILE = "./autofact-groups.json";
let autoFactGroups = fs.existsSync(SETTINGS_FILE)
  ? JSON.parse(fs.readFileSync(SETTINGS_FILE))
  : [];

let globalSock = null;

// Send message with context
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

// Command to toggle autofacts
zokou({
  nomCom: "autofacts",
  categorie: "Group",
  reaction: "🧠",
}, async (jid, sock, data) => {
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
    autoFactGroups = autoFactGroups.filter(id => id !== groupId);
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(autoFactGroups));
    return replyWithContext(sock, jid, ms, "❌ Auto Fact messages disabled.");
  }

  return replyWithContext(sock, jid, ms, "Invalid argument. Use 'on' or 'off'.");
});

// Fixed: Kiswahili translation using LibreTranslate mirror
async function translateToSwahili(text) {
  try {
    console.log("Translating using Argos LibreTranslate...");
    const res = await axios.post("https://translate.argosopentech.com/translate", {
      q: text,
      source: "en",
      target: "sw",
      format: "text",
    }, {
      headers: { "Content-Type": "application/json" }
    });

    if (res.data?.translatedText) {
      return res.data.translatedText;
    } else {
      console.warn("Empty translation response");
    }
  } catch (err) {
    console.error("Translation error:", err.message || err);
  }

  return "⚠️ Kiswahili translation unavailable.";
}

// Scheduled auto facts every 5 minutes
cron.schedule("0 */5 * * * *", async () => {
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
        await replyWithContext(
          globalSock,
          groupId,
          null,
          `🧠 *Random Fact*\n\n${factEn}\n\n*🌍 Kiswahili:* ${factSw}`
        );
      } catch (err) {
        console.error(`Failed to send fact to ${groupId}:`, err);
      }
    }
  } catch (err) {
    console.error("Fact fetch error:", err.message);
  }
});
