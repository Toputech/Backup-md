const { zokou } = require("../framework/zokou");

zokou({
  nomCom: "sendall",
  categorie: "Group",
  reaction: "✉️",
}, async (jid, sock, data) => {
  const { ms, arg } = data;

  const replyWithContext = (text) =>
    sock.sendMessage(jid, {
      text,
      contextInfo: {
        externalAdReply: {
          title: "ALONE MD V²",
          body: "Group Broadcast",
          mediaType: 1,
          thumbnailUrl: "https://i.ibb.co/album/thumbnail.jpg",
          sourceUrl: "https://youtube.com/@alone-bot",
          renderLargerThumbnail: true,
          showAdAttribution: false,
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363295141350550@newsletter',
            newsletterName: 'ALONE MD V²',
            serverMessageId: 143
          }
        },
      },
    }, { quoted: ms });

  // Fetch group metadata if not provided
  let groupMeta = data.groupMetadata;
  if (!groupMeta) {
    try {
      groupMeta = await sock.groupMetadata(jid);
    } catch (e) {
      return replyWithContext("Couldn't fetch group data.");
    }
  }

  const groupJid = groupMeta?.id || jid;
  const isGroup = groupJid.endsWith("@g.us");

  if (!isGroup) return replyWithContext("This command can only be used in a group.");
  if (!Array.isArray(arg) || !arg.length) return replyWithContext("Please provide a message to send.");
  if (!groupMeta.participants) return replyWithContext("Couldn't fetch group data.");

  const textToSend = arg.join(" ");
  const senderId = ms.pushName || "Someone";

  const botIdPrefix = sock.user?.id?.split(":")[0] || "";
  const members = groupMeta.participants
    .map(p => p.id)
    .filter(id => !id.startsWith(botIdPrefix));

  let failedCount = 0;

  for (const member of members) {
    try {
      await sock.sendMessage(member, {
        text: `*Message from group ${groupMeta.subject}*\n\n${textToSend}`,
        contextInfo: {
          externalAdReply: {
            title: "Group Broadcast",
            body: `From ${senderId}`,
            mediaType: 1,
            renderLargerThumbnail: true,
            showAdAttribution: false,
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363295141350550@newsletter',
              newsletterName: 'ALONE MD V²',
              serverMessageId: 143
            }
          },
        },
      });
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      failedCount++;
    }
  }

  return replyWithContext(`Sent message to ${members.length - failedCount} members. Failed to send to ${failedCount} members.`);
});
