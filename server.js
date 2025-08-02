const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/api/instagram/:username', async (req, res) => {
  const { username } = req.params;
  const url = `https://www.instagram.com/${username}/`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    const scriptTag = $('script[type="application/ld+json"]').html();

    if (!scriptTag) return res.json({ error: "User tidak ditemukan atau private." });

    const jsonData = JSON.parse(scriptTag);

    res.json({
      username: jsonData.alternateName.replace('@', ''),
      full_name: jsonData.name,
      bio: jsonData.description,
      profile_pic: jsonData.image,
      followers: jsonData.mainEntityofPage.interactionStatistic.userInteractionCount || 'N/A',
      posts: jsonData.mainEntityofPage.interactionStatistic.interactionType || 'N/A',
      following: 'Tersembunyi',
    });
  } catch (err) {
    res.json({ error: "Gagal mengambil data. Mungkin akun private atau tidak tersedia." });
  }
});

app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));
