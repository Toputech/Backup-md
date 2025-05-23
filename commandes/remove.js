const fs = require("fs");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const conf = require("./set");

const stickers = [
  "https://example.com/sticker1.webp",
  "https://example.com/sticker2.webp"
];

zokou({ nomCom: "remove", categorie: "Group", reaction: "👨🏿‍💼" }, async (dest, zk, commandeOptions) => {
  let {
    msgRepondu,
    infosGroupe,
    auteurMsgRepondu,
    verifGroupe,
    nomAuteurMessage,
    auteurMessage,
    superUser,
    idBot
  } = commandeOptions;

  const context = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363295141350550@newsletter",
      newsletterName: "ALONE Queen MD V²",
      serverMessageId: 143
    },
    externalAdReply: {
      title: "Fun Fact",
      body: "Here's a fun fact to enlighten your day!",
      thumbnailUrl: conf.URL,
      sourceUrl: conf.GURL,
      mediaType: 1
    }
  };

  const send = (text) => zk.sendMessage(dest, { text, contextInfo: context });

  if (!verifGroupe) return send("for groups only");

  let membresGroupe = await infosGroupe.participants;

  const isMember = (user) => membresGroupe.some((m) => m.id === user);
  const getAdmins = (membres) => membres.filter((m) => m.admin).map((m) => m.id);

  const adminList = getAdmins(membresGroupe);
  const isTargetAdmin = adminList.includes(auteurMsgRepondu);
  const isBotAdmin = adminList.includes(idBot);
  const isAuthorAdmin = adminList.includes(auteurMessage);
  const isTargetInGroup = isMember(auteurMsgRepondu);

  try {
    if (isAuthorAdmin || superUser) {
      if (msgRepondu) {
        if (isBotAdmin) {
          if (isTargetInGroup) {
            if (!isTargetAdmin) {
              const stickerUrl = stickers[Math.floor(Math.random() * stickers.length)];
              const sticker = new Sticker(stickerUrl, {
                pack: "ALONE-MD",
                author: nomAuteurMessage,
                type: StickerTypes.FULL,
                categories: ["🤩", "🎉"],
                id: "12345",
                quality: 50,
                background: "#000000"
              });

              await sticker.toFile("st.webp");

              const txt = `@${auteurMsgRepondu.split("@")[0]} was removed from the group.\n`;

              await zk.groupParticipantsUpdate(dest, [auteurMsgRepondu], "remove");

              await zk.sendMessage(dest, {
                text: txt,
                mentions: [auteurMsgRepondu],
                contextInfo: context
              });

              await zk.sendMessage(dest, {
                sticker: fs.readFileSync("st.webp")
              }, { quoted: msgRepondu });
            } else {
              return send("This member cannot be removed because he is an administrator of the group.");
            }
          } else {
            return send("This user is not part of the group.");
          }
        } else {
          return send("Sorry, I cannot perform this action because I am not an administrator of the group.");
        }
      } else {
        return send("Please tag the member to be removed.");
      }
    } else {
      return send("Sorry, I cannot perform this action because you are not an administrator of the group.");
    }
  } catch (e) {
    return send("Oops " + e);
  }
});
