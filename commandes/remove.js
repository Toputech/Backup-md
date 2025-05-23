const { zokou } = require("../framework/zokou");

zokou({
  nomCom: "sendall",
  categorie: "Group",
  reaction: "✉️",
}, async (jid, sock, data) => {
  const { ms, arg, isGroup, groupMetadata } = data;

  const replyWithContext = (text) =>
    sock.sendMessage(jid, {
      text,
      contextInfo: {
        externalAdReply: {
          title: "ALONE MD V²",
          body: "Group Broadcast",
          mediaType: 1,
          thumbnailUrl: "https://i.ibb.co/album/thumbnail.jpg", // optional
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

  if (!isGroup) return replyWithContext("This command can only be used in a group.");
  if (!arg[0]) return replyWithContext("Please provide a message to send.");
  if (!groupMetadata) return replyWithContext("Couldn't fetch group data.");

  const textToSend = arg.join(" ");
  const senderId = ms.pushName || "Someone";

  const members = groupMetadata.participants.map(p => p.id).filter(id => id !== sock.user.id);

  for (const member of members) {
    await sock.sendMessage(member, {
      text: `*Message from group ${groupMetadata.subject}*\n\n${textToSend}`,
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
    }).catch(err => console.log(`Failed to message ${member}:`, err));
  }

  return replyWithContext(`Sent message to ${members.length} members.`);
});
