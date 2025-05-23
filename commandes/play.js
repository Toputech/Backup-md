const { zokou } = require("../framework/zokou");
const axios = require("axios");
const ytSearch = require("yt-search");
const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");

zokou(
  {
    nomCom: "movie",
    aliases: ["getmovie", "moviedl"],
    categorie: "Search",
    reaction: "🎬",
  },
  async (jid, sock, data) => {
    const { arg, ms } = data;

    const repondre = async (text) => {
      await sock.sendMessage(
        jid,
        {
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
              title: "Movie Finder",
              body: "Powered by ALONE MD V²",
              thumbnailUrl: "https://telegra.ph/file/94f5c37a2b1d6c93a97ae.jpg",
              sourceUrl: "https://github.com/Zokou1/ALONE-MD",
              mediaType: 1,
              renderLargerThumbnail: false,
            },
          },
        },
        { quoted: ms }
      );
    };

    if (!arg[0]) return repondre("Please provide a movie title.");

    const query = arg.join(" ");
    await repondre("Searching movie and trailer, please wait...");

    try {
      const apiKey = "38f19ae1"; // Replace with your OMDb API key if needed
      const searchUrl = `http://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${apiKey}`;
      const searchRes = await axios.get(searchUrl);
      const result = searchRes.data;

      if (!result || result.Response === "False" || !result.Search || result.Search.length === 0) {
        let errorMsg = result.Error || "No movie found for that name.";
        return repondre(`OMDb API error: ${errorMsg}`);
      }

      const firstMovie = result.Search[0];
      const detailsUrl = `http://www.omdbapi.com/?i=${firstMovie.imdbID}&apikey=${apiKey}`;
      const detailsRes = await axios.get(detailsUrl);
      const movie = detailsRes.data;

      if (!movie || movie.Response === "False") {
        let errorMsg = movie.Error || "Could not fetch movie details.";
        return repondre(`OMDb API error: ${errorMsg}`);
      }

      const ytResult = await ytSearch(`${movie.Title} trailer`);
      if (!ytResult.videos || ytResult.videos.length === 0) {
        return repondre("No trailer found on YouTube.");
      }

      const trailerVideo = ytResult.videos[0];
      const trailerUrl = trailerVideo.url;
      const tempVideoPath = path.join(__dirname, `temp_trailer_${Date.now()}.mp4`);

      try {
        await new Promise((resolve, reject) => {
          ytdl(trailerUrl, { quality: "highest" })
            .pipe(fs.createWriteStream(tempVideoPath))
            .on("finish", resolve)
            .on("error", reject);
        });
      } catch (err) {
        console.error("YouTube download error:", err);
        return repondre("Could not download trailer from YouTube.");
      }

      await sock.sendMessage(
        jid,
        {
          video: { url: tempVideoPath },
          caption: `🎬 *${movie.Title}* (${movie.Year})\n⭐ *IMDb:* ${movie.imdbRating}/10\n\n📖 *Plot:* ${movie.Plot}`,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363295141350550@newsletter",
              newsletterName: "ALONE Queen MD V²",
              serverMessageId: 143,
            },
            externalAdReply: {
              title: movie.Title,
              body: "Watch the trailer",
              thumbnailUrl:
                movie.Poster !== "N/A"
                  ? movie.Poster
                  : "https://telegra.ph/file/94f5c37a2b1d6c93a97ae.jpg",
              sourceUrl: `https://www.imdb.com/title/${movie.imdbID}`,
              mediaType: 1,
              renderLargerThumbnail: true,
            },
          },
        },
        { quoted: ms }
      );

      fs.unlink(tempVideoPath, (err) => {
        if (err) console.error("Failed to delete temp trailer video:", err);
      });
    } catch (err) {
      console.error("Movie fetch or send error:", err.stack || err);
      return repondre("Failed to fetch movie info or send trailer. Try again later.");
    }
  }
);
zokou({
  nomCom: "lyrics",
  aliases: ["ly", "songlyrics", "lyric"],
  categorie: "Search",
  reaction: "📝",
}, async (jid, sock, data) => {
  const { arg, ms } = data;

  const repondre = async (text) => {
    await sock.sendMessage(jid, {
      text,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363295141350550@newsletter',
          newsletterName: 'ALONE Queen MD V²',
          serverMessageId: 143
        },
        externalAdReply: {
          title: "🎵 ALONE MD LYRICS FINDER",
          body: "Powered by ALONE MD V²",
          thumbnailUrl: "https://telegra.ph/file/94f5c37a2b1d6c93a97ae.jpg",
          sourceUrl: "https://github.com/Zokou1/ALONE-MD",
          mediaType: 1,
          renderLargerThumbnail: false,
          showAdAttribution: false,
        },
      },
    }, { quoted: ms });
  };

  if (!arg[0]) return repondre("Please provide the song name.");

  const query = arg.join(" ");

  // List of fallback APIs
  const apiList = [
    `https://some-random-api.ml/lyrics?title=${encodeURIComponent(query)}`,
    `https://api.lyrics.ovh/v1/${encodeURIComponent(query.split(" ")[0])}/${encodeURIComponent(query)}`,
    `https://lyrist.vercel.app/api/${encodeURIComponent(query)}`,
    `https://api.song.link/v1-alpha.1/links?title=${encodeURIComponent(query)}`,
    `https://api.popcat.xyz/lyrics?song=${encodeURIComponent(query)}`
  ];

  let lyricsData = null;
  let source = null;

  for (const url of apiList) {
    try {
      const res = await axios.get(url);
      if (res.data && (res.data.lyrics || res.data.result || res.data.content)) {
        lyricsData = res.data;
        source = url;
        break;
      }
    } catch (err) {
      continue;
    }
  }

  if (!lyricsData) return repondre("Couldn't find lyrics from any source. Try again later or with a different song.");

  let title = lyricsData.title || query;
  let author = lyricsData.author || lyricsData.artist || "Unknown Artist";
  let lyrics = lyricsData.lyrics || lyricsData.result?.lyrics || lyricsData.content || "Lyrics not available.";
  lyrics = lyrics.slice(0, 4096);
  const thumbnail = lyricsData.thumbnail?.genius || "https://telegra.ph/file/94f5c37a2b1d6c93a97ae.jpg";
  const link = lyricsData.links?.genius || lyricsData.url || "https://github.com/Zokou1/ALONE-MD";

  const message = `*🎵 Title:* ${title}\n*👤 Artist:* ${author}\n\n${lyrics}`;

  await sock.sendMessage(jid, {
    image: { url: thumbnail },
    caption: message,
    contextInfo: {
      externalAdReply: {
        title: title,
        body: `By ${author}`,
        mediaType: 1,
        thumbnailUrl: thumbnail,
        sourceUrl: link,
        renderLargerThumbnail: false,
        showAdAttribution: false,
      },
    },
  }, { quoted: ms });
});


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
          renderLargerThumbnail: false,
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
          renderLargerThumbnail: false,
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
  const { arg, ms } = data;

  const repondre = async (text) => {
    await sock.sendMessage(jid, {
      text,
      contextInfo: {forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363295141350550@newsletter',
              newsletterName: 'ALONE Queen MD V²',
              serverMessageId: 143},
        externalAdReply: {
          title: "♻️ ALONE MD AUDIO DOWNLOADER ♻️",
          body: "Powered by ALONE MD V²",
          thumbnailUrl: "https://telegra.ph/file/94f5c37a2b1d6c93a97ae.jpg",
          sourceUrl: "https://github.com/Zokou1/ALONE-MD",
          mediaType: 1,
          renderLargerThumbnail: false,
          showAdAttribution: false,
        },
      },
    }, { quoted: ms });
  };

  if (!arg[0]) return repondre("Please provide a Audio name.");
  const query = arg.join(" ");

  try {
    const results = await ytSearch(query);
    if (!results || !results.videos.length)
      return repondre("No audio found for the specified query.");

    const video = results.videos[0];
    const videoUrl = video.url;
    const title = video.title;

    // Attempt to split title into artist and song
    const [artist, songTitle] = title.includes(" - ") ? title.split(" - ", 2) : ["Unknown Artist", title];

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

    const { download_url, thumbnail } = response.result;

    await sock.sendMessage(jid, {
      audio: { url: download_url },
      mimetype: "audio/mp4",
      contextInfo: {
        externalAdReply: {
          title: "♻️ ALONE MD AUDIO DOWNLOADER ♻️",
          body: `🎵 ${artist} - ${songTitle}`,
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
