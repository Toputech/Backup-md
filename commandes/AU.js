const { zokou } = require("../framework/zokou");
const cron = require("node-cron");
const fs = require("fs");
const axios = require("axios");
const conf = require(__dirname + "/../set");
const googleTranslate = require('@vitalets/google-translate-api');

const SETTINGS_FILE = "./autofact-groups.json";
let autoFactGroups = fs.existsSync(SETTINGS_FILE)
  ? JSON.parse(fs.readFileSync(SETTINGS_FILE))
  : [];

let globalSock = null; // store sock for scheduled task

// Reply with context info
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

// Command to toggle autofacts (works in groups & private chats)
zokou({
  nomCom: "autofacts",
  categorie: "Group",
  reaction: "🧠",
}, async (jid, sock, data) => {
  globalSock = sock; // set global sock
  const { arg, groupMetadata, ms, isGroup } = data;

  // Allow command in groups and private chats
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

// Multiple translation API function
async function translateToSwahili(text) {
  const translators = [
    async (txt) => {
      // LibreTranslate main
      const res = await axios.post(
        "https://libretranslate.com/translate",
        {
          q: txt,
          source: "en",
          target: "sw",
          format: "text",
        },
        { headers: { "Content-Type": "application/json" } }
      );
      return res.data.translatedText;
    },
    async (txt) => {
      // LibreTranslate mirror
      const res = await axios.post(
        "https://translate.argosopentech.com/translate",
        {
          q: txt,
          source: "en",
          target: "sw",
          format: "text",
        },
        { headers: { "Content-Type": "application/json" } }
      );
      return res.data.translatedText;
    },
    async (txt) => {
      // Google Translate unofficial API
      const res = await googleTranslate(txt, { from: "en", to: "sw" });
      return res.text;
    },
  ];

  for (const translator of translators) {
    try {
      const translated = await translator(text);
      if (translated) return translated;
    } catch (err) {
      console.warn("Translation attempt failed:", err.message || err);
    }
  }

  return "Translation unavailable.";
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
          `🧠 *Random Fact*\n\n${factEn}\n\n*🌍 Swahili:* ${factSw}`
        );
      } catch (err) {
        console.error(`Failed to send fact to ${groupId}:`, err);
      }
    }
  } catch (err) {
    console.error("Fact fetch error:", err.message);
  }
});
