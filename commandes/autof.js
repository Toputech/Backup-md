const { zokou } = require("../framework/zokou");
const cron = require("node-cron");
const fs = require("fs");
const axios = require("axios");
const conf = require(__dirname + "/../set");

const SETTINGS_FILE = "./autofact-groups.json";
let autoFactGroups = fs.existsSync(SETTINGS_FILE)
  ? JSON.parse(fs.readFileSync(SETTINGS_FILE))
  : [];

let globalSock = null; // store sock for scheduled task

// Repondre with context
const replyWithContext = async (sock, jid, ms, text) => {
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
    { quoted: ms }
  );
};

// Command to toggle autofacts
zokou({
  nomCom: "autofacts",
  categorie: "Group",
  reaction: "🧠",
}, async (jid, sock, data) => {
  globalSock = sock; // set global sock
  const { arg, groupMetadata, ms, isGroup } = data;

  if (!isGroup) return replyWithContext(sock, jid, ms, "This command only works in groups.");
  if (!arg[0]) return replyWithContext(sock, jid, ms, "Please use 'on' or 'off'.");

  const groupId = groupMetadata?.id;
  if (!groupId) return replyWithContext(sock, jid, ms, "Group ID not found.");

  if (arg[0] === "on") {
    if (!autoFactGroups.includes(groupId)) {
      autoFactGroups.push(groupId);
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(autoFactGroups));
      return replyWithContext(sock, jid, ms, "✅ Auto Fact messages enabled for this group.");
    } else {
      return replyWithContext(sock, jid, ms, "Auto Fact is already enabled in this group.");
    }
  }

  if (arg[0] === "off") {
    autoFactGroups = autoFactGroups.filter(id => id !== groupId);
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(autoFactGroups));
    return replyWithContext(sock, jid, ms, "❌ Auto Fact messages disabled for this group.");
  }

  return replyWithContext(sock, jid, ms, "Invalid argument. Use 'on' or 'off'.");
});

// Scheduled auto facts every 5 minutes
cron.schedule("0 */5 * * * *", async () => {
  if (!globalSock) {
    console.log("No sock connection available yet.");
    return;
  }

  try {
    const res = await axios.get("https://uselessfacts.jsph.pl/random.json?language=en");
    const factEn = res.data.text;

    // Translate to Swahili using LibreTranslate
    let factSw = "Translation failed.";
    try {
      const translation = await axios.post("https://libretranslate.com/translate", {
        q: factEn,
        source: "en",
        target: "sw",
        format: "text"
      }, {
        headers: { "Content-Type": "application/json" }
      });

      factSw = translation.data.translatedText;
    } catch (err) {
      console.error("Translation error:", err.response?.data || err.message);
    }

    for (const groupId of autoFactGroups) {
      try {
        await globalSock.sendMessage(groupId, {
          text: `🧠 *Random Fact*\n\n${factEn}\n\n*🌍 Swahili:* ${factSw}`,
          contextInfo: {
            externalAdReply: {
              title: "Did You Know?",
              body: factEn,
              mediaType: 1,
              thumbnailUrl: "https://telegra.ph/file/94f5c37a2b1d6c93a97ae.jpg",
              sourceUrl: "https://uselessfacts.jsph.pl/",
              renderLargerThumbnail: true,
            },
          },
        });
      } catch (err) {
        console.error(`Failed to send fact to ${groupId}:`, err);
      }
    }
  } catch (err) {
    console.error("Fact fetch error:", err.message);
  }
});
