const { zokou } = require("../framework/zokou");
const axios = require("axios");
const ytSearch = require("yt-search");

zokou({
  nomCom: "playvideo",
  aliases: ["video", "ytvideo", "ytmp4"],
  categorie: "Search",
  reaction: "⬇️",
}, async (jid, sock, data) => {
  const { arg, ms } = data;

  const repondre = async (text) => {
    await sock.sendMessage(jid, {
      text,
      contextInfo: {
        externalAdReply: {
          title: "ALONE MD VIDEO DOWNLOADER",
          body: "Enjoy using ALONE MD ",
          thumbnailUrl: "https://telegra.ph/file/7e0d3059fa1d30cfd278b.jpg",
          mediaType: 1,
          renderLargerThumbnail: true,
        },
      },
    }, { quoted: ms });
  };

  if (!arg[0]) return repondre("Please provide a video name.");
  const query = arg.join(" ");

  try {
    const results = await ytSearch(query);
    if (!results || !results.videos.length)
      return repondre("No video found for the specified query.");

    const video = results.videos[0];
    const videoUrl = video.url;

    await sock.sendMessage(jid, {
      text: "```Downloading video...```",
      contextInfo: {
        externalAdReply: {
          title: video.title,
          body: "Searching YouTube...",
          thumbnailUrl: video.thumbnail,
          sourceUrl: videoUrl,
          mediaType: 1,
          renderLargerThumbnail: true,
        },
      },
    }, { quoted: ms });

    const tryApi = async (url) => {
      try {
        const res = await axios.get(url);
        return res.data;
      } catch {
        return { success: false };
      }
    };

    let response =
      await tryApi(`https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(videoUrl)}&apikey=gifted-md`)
      || await tryApi(`https://www.dark-yasiya-api.site/download/ytmp4?url=${encodeURIComponent(videoUrl)}`)
      || await tryApi(`https://api.dreaded.site/api/ytdl/video?query=${encodeURIComponent(videoUrl)}`);

    if (!response.success) return repondre("All sources failed. Try again later.");

    const { title, download_url, thumbnail } = response.result;

    await sock.sendMessage(jid, {
      video: { url: download_url },
      caption: title,
      mimetype: "video/mp4",
      contextInfo: {
        externalAdReply: {
          title,
          body: "Tap to watch on YouTube",
          mediaType: 1,
          thumbnailUrl: thumbnail,
          renderLargerThumbnail: true,
          showAdAttribution: false,
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363295141350550@newsletter',
            newsletterName: 'ALONE  MD V²',
            serverMessageId: 143
          }
        },
      },
    }, { quoted: ms });

  } catch (err) {
    console.error("Video Download Error:", err);
    return repondre("Video download failed: " + (err.message || err));
  }
});
zokou({
  nomCom: "play",
  aliases: ["song", "ytmp3", "audio", "mp3"],
  categorie: "Search",
  reaction: "⬇️",
}, async (jid, sock, data) => {
  const { arg, ms, repondre } = data;

  if (!arg[0]) return repondre("Please provide a video name.");
  const query = arg.join(" ");

  try {
    const results = await ytSearch(query);
    if (!results || !results.videos.length)
      return repondre("No video found for the specified query.");

    const video = results.videos[0];
    const videoUrl = video.url;

    await sock.sendMessage(jid, { text: "```Downloading....```" }, { quoted: ms });

    const tryApi = async (url) => {
      try {
        const res = await axios.get(url);
        return res.data;
      } catch {
        return { success: false };
      }
    };

    let response =
      await tryApi(`https://apis.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(videoUrl)}&apikey=gifted-md`)
      || await tryApi(`https://www.dark-yasiya-api.site/download/ytmp3?url=${encodeURIComponent(videoUrl)}`)
      || await tryApi(`https://api.dreaded.site/api/ytdl/video?query=${encodeURIComponent(videoUrl)}`);

    if (!response.success) return repondre("All sources failed. Try again later.");

    const { title, download_url, thumbnail } = response.result;

    await sock.sendMessage(jid, {
      audio: { url: download_url },
      mimetype: "audio/mp4",
      contextInfo: {
        externalAdReply: {
          title: "♻️ALONE MD AUDIO DOWNLOADER ♻️",
          body: "Tap to open",
          mediaType: 1,
          thumbnailUrl: thumbnail,
          sourceUrl: videoUrl,
          renderLargerThumbnail: false,
          showAdAttribution: false,
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363295141350550@newsletter',
            newsletterName: 'ALONE  MD V²',
            serverMessageId: 143
          }
        },
      },
    }, { quoted: ms });

  } catch (err) {
    console.error("Download Error:", err);
    return repondre("Download failed: " + (err.message || err));
  }
});
