const {zokou} = require('../framework/zokou');
const fs = require('fs');
const getFBInfo = require("@xaviabot/fb-downloader");
const axios = require("axios");

zokou(
  {
    nomCom: "autodl",
    categorie: "Download",
    reaction: "⚡",
  },
  async (dest, zk, { repondre, ms, arg }) => {
    let url = arg[0];

    // Button handling
    if (ms.message?.buttonsResponseMessage) {
      const selectedId = ms.message.buttonsResponseMessage.selectedButtonId;

      if (selectedId === "facebook_btn") {
        repondre("📽️ Please send your Facebook video link now.");
        return;
      } else if (selectedId === "test_btn1") {
        repondre("🧪 You clicked Test 1.");
        return;
      } else if (selectedId === "test_btn2") {
        repondre("🧪 You clicked Test 2.");
        return;
      }
    }

    if (!url) {
      // Show buttons
      await zk.sendMessage(
        dest,
        {
          text: "Send a Facebook / Instagram / TikTok link or choose one below:",
          footer: "ALONE-MD Downloader",
          templateButtons: [
            {
              index: 1,
              quickReplyButton: {
                displayText: "📽️ Facebook Downloader",
                id: "facebook_btn",
              },
            },
            {
              index: 2,
              quickReplyButton: {
                displayText: "🧪 Test 1",
                id: "test_btn1",
              },
            },
            {
              index: 3,
              quickReplyButton: {
                displayText: "🧪 Test 2",
                id: "test_btn2",
              },
            },
          ],
        },
        { quoted: ms }
      );
      return;
    }

    url = url.toLowerCase();
    let platform = null;

    if (url.includes("facebook.com") || url.includes("fb.watch")) platform = "facebook";
    else if (url.includes("tiktok.com")) platform = "tiktok";
    else if (url.includes("instagram.com/reel") || url.includes("instagram.com/p")) platform = "instagram";
    else {
      repondre("❌ Invalid link. Supported platforms: Facebook, TikTok, Instagram.");
      return;
    }

    try {
      let res, videoUrl, thumb, title;

      if (platform === "facebook") {
        res = await axios.get("https://api.akuari.my.id/downloader/fb", { params: { link: url } });
        const d = res.data.respon;
        videoUrl = d.hd || d.sd;
        thumb = d.thumb;
        title = d.title || "Facebook Video";
      } else if (platform === "tiktok") {
        res = await axios.get("https://api.akuari.my.id/downloader/tiktok", { params: { link: url } });
        const d = res.data.respon;
        videoUrl = d.video;
        thumb = d.cover;
        title = d.title || "TikTok Video";
      } else if (platform === "instagram") {
        res = await axios.get("https://api.akuari.my.id/downloader/ig", { params: { link: url } });
        const d = res.data.respon[0];
        videoUrl = d.url;
        thumb = d.thumb;
        title = "Instagram Reel";
      }

      if (!videoUrl) {
        repondre("❌ Could not retrieve the video.");
        return;
      }

      // Send thumbnail if exists
      if (thumb) {
        await zk.sendMessage(dest, {
          image: { url: thumb },
          caption: `*${platform.toUpperCase()}*\n${title}`
        }, { quoted: ms });
      }

      // Send the video
      await zk.sendMessage(dest, {
        video: { url: videoUrl },
        caption: `✅ Here's your ${platform} video!\n_Powered by ALONE-MD_`
      }, { quoted: ms });

    } catch (err) {
      console.error("Downloader error:", err.message);
      repondre("❌ Error while downloading. Try another link.");
    }
  }
);
