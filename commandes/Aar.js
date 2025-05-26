const {zokou} = require('../framework/zokou');
const fs = require('fs');
const getFBInfo = require("@xaviabot/fb-downloader");
const { default: axios } = require('axios');

// In-memory map to track users waiting to send FB links
const waitingForFBLink = new Map();

zokou(
  {
    nomCom: "autodl",
    categorie: "Download",
    reaction: "⚡",
  },
  async (dest, zk, { repondre, ms, arg }) => {
    if (!arg[0]) {
      repondre("Send a Facebook / TikTok / Instagram video link or press buttons below.");
      // Send buttons here to start interaction
      await zk.sendMessage(
        dest,
        {
          text: "Choose an option or send a link directly:",
          footer: "ALONE-MD Downloader",
          buttons: [
            {
              buttonId: "facebook_btn",
              buttonText: { displayText: "📽️ Facebook Downloader" },
              type: 1,
            },
            {
              buttonId: "test_btn1",
              buttonText: { displayText: "🧪 Test 1" },
              type: 1,
            },
            {
              buttonId: "test_btn2",
              buttonText: { displayText: "🧪 Test 2" },
              type: 1,
            },
          ],
          headerType: 1,
        },
        { quoted: ms }
      );
      return;
    }

    const url = arg[0].toLowerCase();

    // Detect platform
    let platform = null;
    if (url.includes("facebook.com") || url.includes("fb.watch")) platform = "facebook";
    else if (url.includes("tiktok.com")) platform = "tiktok";
    else if (url.includes("instagram.com/reel") || url.includes("instagram.com/p")) platform = "instagram";
    else {
      repondre("Unsupported link. Only Facebook, TikTok, or Instagram allowed.");
      return;
    }

    try {
      let data = null;
      if (platform === "facebook") {
        const res = await axios.get("https://api.akuari.my.id/downloader/fb", { params: { link: url } });
        const d = res.data.respon;
        data = {
          title: d.title,
          video: d.hd || d.sd,
          thumb: d.thumb,
        };
      } else if (platform === "tiktok") {
        const res = await axios.get("https://api.akuari.my.id/downloader/tiktok", { params: { link: url } });
        const d = res.data.respon;
        data = {
          title: d.title || "TikTok Video",
          video: d.video,
          thumb: d.cover,
        };
      } else if (platform === "instagram") {
        const res = await axios.get("https://api.akuari.my.id/downloader/ig", { params: { link: url } });
        const d = res.data.respon[0];
        data = {
          title: "Instagram Video",
          video: d.url,
          thumb: d.thumb || null,
        };
      }

      if (!data || !data.video) {
        repondre(`❌ Failed to download the ${platform} video.`);
        return;
      }

      // Send thumbnail if exists
      if (data.thumb) {
        await zk.sendMessage(
          dest,
          { image: { url: data.thumb }, caption: `*${platform.toUpperCase()}*\n${data.title}` },
          { quoted: ms }
        );
      }

      // Send video with buttons
      await zk.sendMessage(
        dest,
        {
          video: { url: data.video },
          caption: `✅ Here's your ${platform} video!\n_Powered by ALONE-MD_`,
          footer: "Choose an option below:",
          buttons: [
            {
              buttonId: "facebook_btn",
              buttonText: { displayText: "📽️ Facebook Downloader" },
              type: 1,
            },
            {
              buttonId: "test_btn1",
              buttonText: { displayText: "🧪 Test 1" },
              type: 1,
            },
            {
              buttonId: "test_btn2",
              buttonText: { displayText: "🧪 Test 2" },
              type: 1,
            },
          ],
          headerType: 4,
        },
        { quoted: ms }
      );
    } catch (error) {
      console.error("AutoDL error:", error);
      repondre("❌ Something went wrong while downloading.");
    }
  }
);

// Handle button clicks:

zokou({ nomCom: "facebook_btn" }, async (dest, zk, { repondre }) => {
  waitingForFBLink.set(dest, true);
  repondre("📥 Send me a Facebook video link.");
});

zokou({ nomCom: "test_btn1" }, async (dest, zk, { repondre }) => {
  repondre("✅ Test button 1 clicked.");
});

zokou({ nomCom: "test_btn2" }, async (dest, zk, { repondre }) => {
  repondre("✅ Test button 2 clicked.");
});

// Catch all text messages to listen for FB links after button 1:

zokou(
  {
    nomCom: "message",
  },
  async (dest, zk, { ms, repondre, text }) => {
    if (!text) return;

    if (waitingForFBLink.get(dest)) {
      if (text.includes("facebook.com") || text.includes("fb.watch") || text.includes("fbcdn.net")) {
        waitingForFBLink.delete(dest);
        try {
          await downloadFacebookVideo(text, dest, zk, ms, repondre);
        } catch (e) {
          console.error(e);
          repondre("❌ Failed to download Facebook video.");
        }
      } else {
        repondre("❌ That's not a valid Facebook video link. Please send a valid one.");
      }
    }
  }
);

// Helper function for Facebook download

async function downloadFacebookVideo(link, dest, zk, ms, repondre) {
  try {
    const res = await axios.get("https://api.akuari.my.id/downloader/fb", {
      params: { link },
    });
    const d = res.data.respon;
    if (!d || (!d.hd && !d.sd)) {
      repondre("❌ Could not fetch video.");
      return;
    }

    const caption = `*Title:* ${d.title}\nPowered by ALONE-MD`;

    if (d.thumb) {
      await zk.sendMessage(dest, { image: { url: d.thumb }, caption }, { quoted: ms });
    }

    await zk.sendMessage(dest, { video: { url: d.hd || d.sd }, caption: "Here's your Facebook video!" }, { quoted: ms });
  } catch (error) {
    console.error(error);
    repondre("❌ Error fetching Facebook video.");
  }
}
