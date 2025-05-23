const { zokou, superUser } = require("../framework/zokou"); // Assuming superUser is exported

zokou({
  nomCom: "sendall",
  categorie: "Group",
  reaction: "✉️",
}, async (jid, sock, data) => {
  const { ms, arg, groupMetadata, isGroup } = data;

  const replyWithContext = (text) =>
    sock.sendMessage(jid, {
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
          showAdAttribution: false,
        },
      },
    }, { quoted: ms });

  if (!isGroup) return replyWithContext("This command can only be used in a group.");

  const senderId = ms.key.participant || ms.key.remoteJid;
  const isSuperUser = superUser.includes(senderId);

  let metadata = groupMetadata;
  if (!metadata) {
    try {
      metadata = await sock.groupMetadata(jid);
    } catch {
      return replyWithContext("Couldn't fetch group metadata.");
    }
  }

  const admins = metadata.participants
    .filter(p => p.admin !== null)
    .map(p => p.id);

  const isAdmin = admins.includes(senderId);

  if (!isSuperUser && !isAdmin) {
    return replyWithContext("Only group admins or super users can use this command.");
  }

  if (!Array.isArray(arg) || !arg.length) return replyWithContext("Please provide a message to send.");

  const textToSend = arg.join(" ");
  const members = metadata.participants.map(p => p.id);

  let failedCount = 0;

  for (const member of members) {
    if (member === sock.user.id) continue;
    try {
      await sock.sendMessage(member, {
        text: `*Message from group ${metadata.subject}*\n\n${textToSend}`,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363295141350550@newsletter",
            newsletterName: "ALONE MD V²",
            serverMessageId: 143,
          },
          externalAdReply: {
            title: "Group Broadcast",
            body: `From ${ms.pushName || "Admin"}`,
            mediaType: 1,
            renderLargerThumbnail: false,
            showAdAttribution: false,
          },
        },
      });
      await new Promise(r => setTimeout(r, 1000));
    } catch {
      failedCount++;
    }
  }

  return replyWithContext(`Sent message to ${members.length - failedCount} members. Failed: ${failedCount}`);
});
