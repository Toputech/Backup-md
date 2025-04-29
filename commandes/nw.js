const { zokou } = require('../framework/zokou');
const traduire = require("../framework/traduction") ;
const { default: axios } = require('axios');
const conf = require('../set');
const { generateProfilePicture } = require("../framework/dl/Function");
const { S_WHATSAPP_NET } = require('@whiskeysockets/baileys');
const fs = require("fs");

const util = require('util');
const fs = require('fs-extra');
const { format } = require(__dirname + "/../framework/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");
const more = String.fromCharCode(8206)
const readmore = more.repeat(4001)
const conf = require(__dirname + '/../set');

// Football Data API URL and your API key
const apiKey = '7b6507c792f74a2b9db41cfc8fd8cf05'; // Replace with your actual API key
const apiUrl = 'https://api.football-data.org/v4/competitions';

// Helper function to fetch data from the API
const fetchFootballData = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'X-Auth-Token': apiKey,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

/** ✅ Premier League (EPL) Standings */
zokou({
  nomCom: "epl_table",
  categorie: "football live",
  reaction: "⚽"
}, async (dest, zk, commandOptions) => {
  const { repondre } = commandOptions;
  
  // API URL for Premier League standings
  const standingsUrl = `${apiUrl}/PL/standings`;

  const data = await fetchFootballData(standingsUrl);
  if (!data || !data.standings) {
    return repondre("❌ Error fetching EPL standings.");
  }

  const standings = data.standings[0].table;
  let standingsMessage = "📊 *Premier League Table*\n";
  standings.forEach((team, index) => {
    standingsMessage += `${index + 1}. ${team.team.name} - ${team.points} Points\n`;
  });

  repondre(standingsMessage);
});

/** ✅ Premier League Matchday */
zokou({
  nomCom: "epl_matchday",
  categorie: "football live",
  reaction: "📅"
}, async (dest, zk, commandOptions) => {
  const { repondre } = commandOptions;

  // API URL for upcoming EPL matches
  const matchesUrl = `${apiUrl}/PL/matches`;

  const data = await fetchFootballData(matchesUrl);
  if (!data || !data.matches) {
    return repondre("❌ Error fetching EPL matchday.");
  }

  const matches = data.matches;
  let matchdayMessage = "🗓️ *Upcoming EPL Matches*\n";
  matches.forEach(match => {
    matchdayMessage += `${match.homeTeam.name} vs ${match.awayTeam.name} - ${match.utcDate}\n`;
  });

  repondre(matchdayMessage);
});

/** ✅ Premier League Top Scorers */
zokou({
  nomCom: "epl_top_scorer",
  categorie: "football live",
  reaction: "⚽"
}, async (dest, zk, commandOptions) => {
  const { repondre } = commandOptions;

  // API URL for Premier League top scorers
  const topScorerUrl = `${apiUrl}/PL/scorers`;

  const data = await fetchFootballData(topScorerUrl);
  if (!data || !data.scorers) {
    return repondre("❌ Error fetching EPL top scorers.");
  }

  const topScorers = data.scorers;
  let topScorerMessage = "🏆 *EPL Top Scorers*\n";
  topScorers.forEach((scorer, index) => {
    topScorerMessage += `${index + 1}. ${scorer.player.name} - ${scorer.numberOfGoals} Goals\n`;
  });

  repondre(topScorerMessage);
});

/** ✅ Premier League Top Assists */
zokou({
  nomCom: "epl_top_assist",
  categorie: "football live",
  reaction: "🎯"
}, async (dest, zk, commandOptions) => {
  const { repondre } = commandOptions;

  // API URL for Premier League top assists
  const topAssistUrl = `${apiUrl}/PL/assists`;

  const data = await fetchFootballData(topAssistUrl);
  if (!data || !data.assists) {
    return repondre("❌ Error fetching EPL top assists.");
  }

  const topAssists = data.assists;
  let topAssistMessage = "🎯 *EPL Top Assists*\n";
  topAssists.forEach((assist, index) => {
    topAssistMessage += `${index + 1}. ${assist.player.name} - ${assist.numberOfAssists} Assists\n`;
  });

  repondre(topAssistMessage);
});

/** ✅ Premier League News */
zokou({
  nomCom: "epl_news",
  categorie: "football live",
  reaction: "📰"
}, async (dest, zk, commandOptions) => {
  const { repondre } = commandOptions;

  // API URL for Premier League news (You may need to use another news API for this)
  const newsUrl = `https://newsapi.org/v2/everything?q=Premier+League&apiKey=YOUR_NEWSAPI_KEY`; // Replace with your NewsAPI key

  try {
    const response = await axios.get(newsUrl);
    if (response.data.status !== "ok") return repondre("❌ Error fetching EPL news.");

    let newsMessage = "📰 *EPL News*\n";
    response.data.articles.forEach((article, index) => {
      newsMessage += `${index + 1}. [${article.title}](${article.url})\n`;
    });

    repondre(newsMessage);
  } catch (error) {
    console.error(error);
    repondre("❌ Error fetching EPL news.");
  }
});

/** ✅ EPL Highlights (You can integrate video highlight API) */
zokou({
  nomCom: "epl_highlights",
  categorie: "football live",
  reaction: "📺"
}, async (dest, zk, commandOptions) => {
  const { repondre } = commandOptions;

  // Example placeholder for video highlights (Consider using a video API)
  const highlightsUrl = `https://api.example.com/epl-highlights`; // Replace with actual highlight API

  try {
    const response = await axios.get(highlightsUrl);
    if (!response.data.highlights) return repondre("❌ No highlights found.");

    let highlightsMessage = "🎬 *EPL Highlights*\n";
    response.data.highlights.forEach((highlight, index) => {
      highlightsMessage += `${index + 1}. [Watch Highlight](${highlight.url})\n`;
    });

    repondre(highlightsMessage);
  } catch (error) {
    console.error(error);
    repondre("❌ Error fetching EPL highlights.");
  }
});
zokou({ nomCom: "cmd", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { ms, repondre ,prefixe,nomAuteurMessage,mybotpic} = commandeOptions;
    let { cm } = require(__dirname + "/../framework//zokou");
    var coms = {};
    var mode = "public";
    
    if ((s.PUBLIC_MODE).toLocaleLowerCase() != "yes") {
        mode = "private";
    }


    

    cm.map(async (com, index) => {
        if (!coms[com.categorie])
            coms[com.categorie] = [];
        coms[com.categorie].push(com.nomCom);
    });

    moment.tz.setDefault("Africa/Nairobi");

// Créer une date et une heure en GMT
const temps = moment().format('HH:mm:ss');
const date = moment().format('DD/MM/YYYY');

  let infoMsg =  `
  *Hey🖐️* *${nomAuteurMessage}*
  
  *ALONE MD IS RUNNING WITH [${cm.length}0] COMMANDS*

  *More commands will be out soon*
 
  
 `;
    
let menuMsg = `
> ⏲️ ᴛɪᴍᴇ: ${temps}
> 📅 ᴅᴀᴛᴇ: ${date} 


> Made by : © ᴛᴏᴘᴜ ᴛᴇᴄʜ 
`;

   var lien = mybotpic();

   if (lien.match(/\.(mp4|gif)$/i)) {
    try {
        zk.sendMessage(dest, { video: { url: lien }, caption:infoMsg + menuMsg, footer: "Je suis *Topu*, déveloper Topu Tech" , gifPlayback : true }, { quoted: ms });
    }
    catch (e) {
        console.log("🥵🥵 Menu erreur " + e);
        repondre("🥵🥵 Menu erreur " + e);
    }
} 
// Vérification pour .jpeg ou .png
else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
    try {
        zk.sendMessage(dest, { image: { url: lien }, caption:infoMsg + menuMsg, footer: "Je suis *Topu*, déveloper Topu Tech" }, { quoted: ms });
    }
    catch (e) {
        console.log("🥵🥵 Menu erreur " + e);
        repondre("🥵🥵 Menu erreur " + e);
    }
} 
else {
    
    repondre(infoMsg + menuMsg);
    
}

});
zokou({
  nomCom: "fullpp",
  aliases: ["updatepp", "ppfull"],
  reaction: '🍒',
  categorie: "search"
}, async (dest, zk, commandeOptions) => {
  const { repondre, msgRepondu, auteurMessage } = commandeOptions;

  if (msgRepondu) {
    repondre('quote an image');

    let media;
    if (msgRepondu.imageMessage) {
      media = msgRepondu.imageMessage;
    } else {
      repondre('This is not an image...');
      return;
    }

    try {
      var medis = await zk.downloadAndSaveMediaMessage(media);

      var { img } = await generateProfilePicture(medis);

      await zk.query({
        tag: 'iq',
        attrs: {
          target: undefined,
          to: S_WHATSAPP_NET,
          type: 'set',
          xmlns: 'w:profile:picture'
        },
        content: [
          {
            tag: 'picture',
            attrs: { type: 'image' },
            content: img
          }
        ]
      });

      fs.unlinkSync(medis);
      repondre("Bot Profile Picture Updated");
    } catch (error) {
      repondre("An error occurred while updating bot profile photo: " + error);
    }
  } else {
    repondre('No image was quoted.');
  }
});
zokou({
  'nomCom': "weather",
  'reaction': "🌡️",
  'categorie': "Search"
}, 
    async (_0x626df9, _0x17e5bb, _0x37baf6) => {
  const _0x445647 = _0x1180fa.join(" ");
  if (!_0x445647) {
    return _0xecdf09("Give me location...");
  }
  const _0x470189 = await fetch("https://api.openweathermap.org/data/2.5/weather?q=" + _0x445647 + "&units=metric&appid=060a6bcfa19809c2cd4d97a212b19273&language=en");
  const _0x4bfc6 = await _0x470189.json();
  const _0x3cf19a = _0x4bfc6.name;
  const _0x52e997 = _0x4bfc6.main.temp;
  const _0x32180e = _0x4bfc6.weather[0x0].description;
  const _0x2da493 = _0x4bfc6.main.humidity;
  const _0x368581 = _0x4bfc6.wind.speed;
  const _0x28a97c = _0x4bfc6.rain ? _0x4bfc6.rain['1h'] : 0x0;
  const _0x39a4af = _0x4bfc6.clouds.all;
  const _0x41b2f8 = new Date(_0x4bfc6.sys.sunrise * 0x3e8);
  const _0x4393a0 = new Date(_0x4bfc6.sys.sunset * 0x3e8);
  await _0xecdf09(" *ALONE-MD WEATHER UPDATES* \n\n❄️ Weather in " + _0x3cf19a + "\n\n🌡️ *Temperature:* " + _0x52e997 + "°C\n📝 *Description:* " + _0x32180e + "\n❄️ *Humidity:* " + _0x2da493 + "%\n🌀 *Wind Speed:* " + _0x368581 + " m/s\n🌧️ *Rain Volume (last hour):* " + _0x28a97c + " mm\n☁️ *Cloudiness:* " + _0x39a4af + "%\n🌄 *Sunrise:* " + _0x41b2f8.toLocaleTimeString() + "\n🌅 *Sunset:* " + _0x4393a0.toLocaleTimeString() + "\n🌫️ *Latitude:* " + _0x4bfc6.coord.lat + "\n🌪️ *Longitude:* " + _0x4bfc6.coord.lon + "\n\n🗺 *Country:* " + _0x4bfc6.sys.country + "\n\n\n*°Powered by ALONE-MD*");
});
zokou({
  'nomCom': 'facts',
  'reaction': '👌',
  'categorie': 'User'
}, async (_0x3c85fa, _0xe0dd81, _0x20339c) => {
  const {
    repondre: _0x12e23a,
    arg: _0xec0687,
    ms: _0x5d5368
  } = _0x20339c;
  const _0x5754a8 = await fetch("https://nekos.life/api/v2/fact");
  const _0x21e127 = await _0x5754a8.json();
  _0x12e23a(" *ALONE MD FACT MESSAGE* \n*💠* " + _0x21e127.fact + "\n\n\n\n\n*© Toputech *\n\n╔═════◇\n║◇ *ALONE MD*\n╚════════════════════>  ");
});

zokou({
  'nomCom': 'define',
  'reaction': '😁',
  'categorie': "Search"
}, async (_0x2d6773, _0x1778cf, _0x5bcf7e) => {
  const {
    repondre: _0x3c6e3b,
    arg: _0x3997ea,
    ms: _0x10a9bb
  } = _0x5bcf7e;
  if (!_0x3997ea || _0x3997ea.length === 0x0) {
    return _0x3c6e3b("provide a term");
  }
  const _0x243eb3 = _0x3997ea.join(" ");
  try {
    let {
      data: _0x31830d
    } = await axios.get("http://api.urbandictionary.com/v0/define?term=" + _0x243eb3);
    var _0x259634 = "\n Word: " + _0x243eb3 + "\n Definition: " + _0x31830d.list[0x0].definition.replace(/\[/g, '').replace(/\]/g, '') + "\n Example: " + _0x31830d.list[0x0].example.replace(/\[/g, '').replace(/\]/g, '');
    return _0x3c6e3b(_0x259634);
  } catch {
    return _0x3c6e3b("No result for " + _0x243eb3);
  }
});
zokou({
  'nomCom': "lyrics",
  'reaction': '🗞',
  'categorie': "Search"
}, async (_0x16b585, _0x24921b, _0x5047e1) => {
  const {
    repondre: _0x323d88,
    arg: _0x47ee56,
    ms: _0x26dbd3
  } = _0x5047e1;
  try {
    if (!_0x47ee56 || _0x47ee56.length === 0x0) {
      return _0x323d88("please provide me the song name");
    }
    const _0x2d6993 = _0x47ee56.join(" ");
    const _0x19a972 = await Client.songs.search(_0x2d6993);
    const _0x349a1c = _0x19a972[0x0];
    const _0x3e8204 = await _0x349a1c.lyrics();
    await _0x24921b.sendMessage(_0x16b585, {
      'text': _0x3e8204
    }, {
      'quoted': _0x26dbd3
    });
  } catch (_0xe736b5) {
    reply("I did not find any lyrics for " + text + ". Try searching a different song.");
    console.log(_0xe736b5);
  }
});
  zokou({ nomCom: "bing", reaction: "😏", categorie: "IA" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;
  
    try {
      if (!arg || arg.length === 0) {
        return repondre(`Please enter the necessary information to generate the image.`);
      }
  
      // Regrouper les arguments en une seule chaîne séparée par "-"
      const image = arg.join(' ');
      const response = await axios.get(`http://api.maher-zubair.tech/ai/photoleap?q=${image}`);
      
      const data = response.data;
      let caption = '*bing images by Fredie Tech*';
      
      if (data.status == 200) {
        // Utiliser les données retournées par le service
        const imageUrl = data.result;
        zk.sendMessage(dest, { image: { url: imageUrl }, caption: caption }, { quoted: ms });
      } else {
        repondre("Error during image generation.");
      }
    } catch (error) {
      console.error('Erreur:', error.message || 'Une erreur s\'est produite');
      repondre("Oops, an error occurred while processing your request");
    }
  });
  
zokou({ nomCom: "vv", categorie: "Mods" }, async (dest, zk, commandeOptions) => {

  const { repondre , msgRepondu , superUser, auteurMessage } = commandeOptions;
  
    if ( superUser) { 
  
      if(msgRepondu) {

        console.log(msgRepondu) ;

        let msg ;
  
        if (msgRepondu.imageMessage) {
  
          
  
       let media  = await zk.downloadAndSaveMediaMessage(msgRepondu.imageMessage) ;
       // console.log(msgRepondu) ;
       msg = {
  
         image : { url : media } ,
         caption : msgRepondu.imageMessage.caption,
         
       }
      
  
        } else if (msgRepondu.videoMessage) {
  
          let media  = await zk.downloadAndSaveMediaMessage(msgRepondu.videoMessage) ;
  
          msg = {
  
            video : { url : media } ,
            caption : msgRepondu.videoMessage.caption,
            
          }
  
        } else if (msgRepondu.audioMessage) {
      
          let media  = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage) ;
         
          msg = {
     
            audio : { url : media } ,
            mimetype:'audio/mp4',
             }     
          
        } else if (msgRepondu.stickerMessage) {
  
      
          let media  = await zk.downloadAndSaveMediaMessage(msgRepondu.stickerMessage)
  
          let stickerMess = new Sticker(media, {
            pack: 'BMW-MD-TAG',
            type: StickerTypes.CROPPED,
            categories: ["🤩", "🎉"],
            id: "12345",
            quality: 70,
            background: "transparent",
          });
          const stickerBuffer2 = await stickerMess.toBuffer();
         
          msg = { sticker: stickerBuffer2}
  
  
        }  else {
            msg = {
               text : msgRepondu.conversation,
            }
        }
  
      zk.sendMessage(auteurMessage,msg)
  
      } else { repondre('Mention the message that you want to save') }
  
  } else {
    repondre('only mods can use this command')
  }
  

  })
