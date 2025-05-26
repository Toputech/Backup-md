const {zokou} = require('../framework/zokou');
const fs = require('fs');
const getFBInfo = require("@xaviabot/fb-downloader");

 const axios = require("axios");

// Track users waiting to send Facebook links
const waitingForFBLink = new Map();

zokou(
  {
    nomCom: "autodl",
    categorie: "Download",
    reaction: "⚡",
  },
  async (dest, zk, { repondre, ms, arg }) => {
    const link = arg[0];

    if (!link) {
      // No link, show buttons
      await zk.sendMessage(
        dest,
        {
          text: "Send a Facebook / TikTok / Instagram link, or choose a button:",
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

    const url = link.toLowerCase();
    let platform = null;
    if (url.includes("facebook.com") || url.includes("fb.watch")) platform = "facebook";
    else if (url.includes("tiktok.com")) platform = "tiktok";
    else if (url.includes("instagram.com/reel") || url.includes("instagram.com/p")) platform = "instagram";
    else {
      repondre("❌ Invalid link. Only Facebook, TikTok, or Instagram supported.");
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
        repondre("❌ Failed to download the video.");
        return;
      }

      if (data.thumb) {
        await zk.sendMessage(
          dest,
          {
            image: { url: data.thumb },
            caption: `*${platform.toUpperCase()}*\n${data.title}`,
          },
          { quoted: ms }
        );
      }

      await zk.sendMessage(
        dest,
        {
          video: { url: data.video },
          caption: `✅ Here's your ${platform} video!\n_Powered by ALONE-MD_`,
          footer: "Choose another option:",
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
    } catch (error) {
      console.error("AutoDL error:", error);
      repondre("❌ Error occurred while downloading.");
    }
  }
);

// Button Handlers

zokou({ nomCom: "facebook_btn" }, async (dest, zk, { repondre }) => {
  waitingForFBLink.set(dest, true);
  repondre("📥 Send me a Facebook video link.");
});

zokou({ nomCom: "test_btn1" }, async (dest, zk, { repondre }) => {
  repondre("✅ You clicked Test 1!");
});

zokou({ nomCom: "test_btn2" }, async (dest, zk, { repondre }) => {
  repondre("✅ You clicked Test 2!");
});

// Listen for reply after Facebook button

zokou(
  { nomCom: "message" },
  async (dest, zk, { ms, text, repondre }) => {
    if (!text) return;

    if (waitingForFBLink.get(dest)) {
      if (text.includes("facebook.com") || text.includes("fb.watch")) {
        waitingForFBLink.delete(dest);
        try {
          await downloadFacebookVideo(text, dest, zk, ms, repondre);
        } catch (e) {
          console.error(e);
          repondre("❌ Could not download the Facebook video.");
        }
      } else {
        repondre("❌ Not a valid Facebook link.");
      }
    }
  }
);

// Facebook video download helper

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

    const caption = `*Title:* ${d.title}\n_Powered by ALONE-MD_`;

    if (d.thumb) {
      await zk.sendMessage(dest, { image: { url: d.thumb }, caption }, { quoted: ms });
    }

    await zk.sendMessage(
      dest,
      {
        video: { url: d.hd || d.sd },
        caption: "✅ Here's your Facebook video!",
      },
      { quoted: ms }
    );
  } catch (error) {
    console.error(error);
    repondre("❌ Error fetching Facebook video.");
  }
}
