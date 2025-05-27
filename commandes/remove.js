const { zokou } = require("../framework/zokou");

// === ACTIVE USER TRACKING ===
const activeUsers = new Set();

sock.ev.on("messages.upsert", async ({ messages }) => {
  for (const msg of messages) {
    const jid = msg.key.participant || msg.key.remoteJid;
    if (jid && jid.endsWith("@s.whatsapp.net")) {
      activeUsers.add(jid);
      setTimeout(() => activeUsers.delete(jid), 10 * 60 * 1000); // 10 min lifetime
    }
  }
});

// === GLOBAL COOLDOWN CONFIG ===
let lastSendallTime = 0;
let lastSenderName = null;
const SENDALL_COOLDOWN = 12 * 60 * 60 * 1000; // 12 hours

// === SENDALL COMMAND ===
zokou({
  nomCom: "sendall",
  categorie: "Group",
  reaction: "✉️",
}, async (jid, sock, data) => {
  const { ms, arg, groupMetadata } = data;
  const chatId = ms.key.remoteJid;

  const replyWithContext = (text) =>
    sock.sendMessage(chatId, {
      text,
      contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363295141350550@newsletter",
          newsletterName: "ALONE Queen MD V²",
          serverMessageId: 143,
        },
        externalAdReply: {
          title: "ALONE MD V²",
          body: "Group Broadcast",
          mediaType: 1,
          thumbnailUrl: "https://i.ibb.co/album/thumbnail.jpg",
          sourceUrl: "https://youtube.com/@alone-bot",
          renderLargerThumbnail: true,
        },
      },
    }, { quoted: ms });

  if (!chatId.endsWith("@g.us")) {
    return replyWithContext("This command can only be used in a group.");
  }

  // Check 12-hour cooldown
  const now = Date.now();
  if (now - lastSendallTime < SENDALL_COOLDOWN) {
    const minutesLeft = Math.ceil((SENDALL_COOLDOWN - (now - lastSendallTime)) / 60000);
    return replyWithContext(`⏱️ Someone already used this command.\nTry again in *${minutesLeft} minutes*.\n\nLast used by: *${lastSenderName || "unknown"}*`);
  }

  if (!arg || arg.length === 0) {
    return replyWithContext("Please provide a message to send.");
  }

  // Set cooldown lock
  lastSendallTime = now;
  lastSenderName = ms.pushName || "Someone";

  const textToSend = arg.join(" ");

  let metadata = groupMetadata;
  if (!metadata) {
    try {
      metadata = await sock.groupMetadata(chatId);
    } catch (err) {
      console.error("Metadata fetch failed:", err);
      return replyWithContext("Couldn't fetch group metadata.");
    }
  }

  let members = metadata.participants.map(p => p.id);

  // Prioritize active users
  const onlineFirst = members.filter(id => activeUsers.has(id));
  const offlineLater = members.filter(id => !activeUsers.has(id));
  members = [...onlineFirst, ...offlineLater];

  let failedCount = 0, sentCount = 0;

  for (const member of members) {
    if (member.split("@")[0] === sock.user.id.split(":")[0]) continue;

    try {
      await sock.sendMessage(member, {
        text: `📢 *Message from group: ${metadata.subject}*\n\n${textToSend}`,
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363295141350550@newsletter",
            newsletterName: "ALONE MD V²",
            serverMessageId: 143,
          },
          externalAdReply: {
            title: "🎭 ALONE MD GROUP BROADCASTER 🏆",
            body: `From ${ms.pushName || "a Member"}`,
            mediaType: 1,
            renderLargerThumbnail: false,
          },
        },
      });

      sentCount++;
      const delay = 5000 + Math.floor(Math.random() * 3000); // 5–8s delay
      await new Promise(r => setTimeout(r, delay));
    } catch (err) {
      console.error(`Failed to message ${member}:`, err?.message || err);
      failedCount++;
    }
  }

  return replyWithContext(`✅ Sent to ${sentCount} members.\n❌ Failed: ${failedCount}\n\nLucky user: *${lastSenderName}*`);
});
