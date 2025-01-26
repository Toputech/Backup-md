"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { zokou } = require("../framework/zokou");

zokou({ nomCom: "repo", catégorie:"Général", reaction: "✨", nomFichier: __filename }, async (dest, zk, commandeOptions) => {
  const githubRepo = 'https://api.github.com/repos/Toputech/ALONE-MD-V1';
  const img = 'https://i.imgur.com/jE8eQsP.jpeg';

  try {
    const response = await fetch(githubRepo);
    const data = await response.json();

    if (data) {
      const repoInfo = {
        stars: data.stargazers_count,
        forks: data.forks_count,
        lastUpdate: data.updated_at,
        owner: data.owner.login,
      };

      const releaseDate = new Date(data.created_at).toLocaleDateString('en-GB');
      const lastUpdateDate = new Date(data.updated_at).toLocaleDateString('en-GB');

      const gitdata = `🫣Ｈｕｒｒａａｈ..!!
      this is •𝘼𝙇𝙊𝙉𝙀-𝙈𝘿•
      ᴏᴜʀ ᴍɪssɪᴏɴ ɪs ᴛᴏ ʟᴇᴛ ʏᴏᴜ ᴇɴᴊᴏʏ ʏᴏᴜʀ ᴡʜᴀᴛsᴀᴘᴘ.... ɪ ʟᴏᴠᴇ ʏᴏᴜ 💘'
      \n support : ,  https://whatsapp.com/channel/0029VaeRrcnADTOKzivM0S1r

🗼 *REPOSITORY:* ${data.html_url}
🌟 *STARS:* ${repoInfo.stars}
🧧 *FORKS:* ${repoInfo.forks}
📅 *RELEASE DATE:* ${releaseDate}
🕐 *UPDATE ON:* ${repoInfo.lastUpdate}
👨‍💻 *OWNER:* *Topu tech*
💞 *THEME:* *TOPU*
🥰 *𝚂𝚒𝚗𝚌𝚎 𝚢𝚘𝚞 𝚑𝚊𝚟𝚎 𝚖𝚎, 𝚢𝚘𝚞'𝚕𝚕 𝚗𝚎𝚟𝚎𝚛 𝚏𝚎𝚎𝚕 𝚊𝚕𝚘𝚗𝚎 !* ❣️
__________________________________
            * ❣️ ©Toputech* `;

      await zk.sendMessage(dest, { image: { url: img }, caption: gitdata });
    } else {
      console.log("Could not fetch data");
    }
  } catch (error) {
    console.log("Error fetching data:", error);
  }
});
