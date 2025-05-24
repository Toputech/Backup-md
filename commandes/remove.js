const { zokou, superUser } = require("../framework/zokou");

zokou({
  nomCom: "sendall",
  categorie: "Group",
  reaction: "✉️",
}, async (jid, sock, data) => {
  const { ms, arg, groupMetadata } = data;

  const chatId = ms.key.remoteJid; // Correct source for chat ID

  const replyWithContext = (text) =>
    sock.sendMessage(chatId, {
      text,
      contextInfo: {
        forwardingScore: 999,
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

  const senderId = ms.participant || ms.key.participant || ms.key.remoteJid;
  const isSuper = superUser.includes(senderId);

  let metadata = groupMetadata;
  if (!metadata) {
    try {
      metadata = await sock.groupMetadata(chatId);
    } catch (err) {
      console.error("Metadata fetch failed:", err);
      return replyWithContext("Couldn't fetch group metadata.");
    }
  }

  const admins = metadata.participants
    .filter(p => p.admin !== null)
    .map(p => p.id);

  const isAdmin = admins.includes(senderId);

  if (!isSuper && !isAdmin) {
    return replyWithContext("Only group admins or super users can use this command.");
  }

  if (!arg || arg.length === 0) {
    return replyWithContext("Please provide a message to send.");
  }

  const textToSend = arg.join(" ");
  const members = metadata.participants.map(p => p.id);
  let failedCount = 0, sentCount = 0;

  for (const member of members) {
    if (member.split("@")[0] === sock.user.id.split(":")[0]) continue; // skip self

    try {
      await sock.sendMessage(member, {
        text: `📢 *Message from group: ${metadata.subject}*\n\n${textToSend}`,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          externalAdReply: {
            title: "Group Broadcast",
            body: `From ${ms.pushName || "an Admin"}`,
            mediaType: 1,
            renderLargerThumbnail: false,
          },
        },
      });
      sentCount++;
      await new Promise(r => setTimeout(r, 1300)); // Slight delay to avoid rate-limit
    } catch (err) {
      console.error(`Failed to message ${member}:`, err?.message || err);
      failedCount++;
    }
  }

  return replyWithContext(`✅ Sent to ${sentCount} members.\n❌ Failed: ${failedCount}`);
});
