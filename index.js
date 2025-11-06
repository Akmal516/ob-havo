const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// 🔑 Tokenni o'z botingnikiga almashtir
const TOKEN = '8330357018:AAG8nVsprjnBi4hd_Yu-uudTRhsdwqkdeVc';
const bot = new TelegramBot(TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "👋 Salom! Men global ob-havo botman 🌍\n" +
    "Shunchaki shahar nomini yozing (masalan: *New York*, *Tashkent*, *Tokyo*) va men sizga ob-havoni aytaman.",
    { parse_mode: "Markdown" }
  );
});

// 🔹 Butun dunyo bo'yicha ob-havo olish
async function getWeather(city) {
  try {
    // 🌐 1️⃣ Geocoding orqali koordinatalarni topish
    const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en`);
    const geoData = geoRes.data;

    if (!geoData.results || geoData.results.length === 0) {
      return "❌ Shahar topilmadi. Iltimos, to'liq nomini yozing (masalan: *Paris, France*).";
    }

    const { latitude, longitude, name, country, timezone } = geoData.results[0];

    // 🌡 2️⃣ Ob-havo ma'lumotlarini olish
    const weatherRes = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );

    const weather = weatherRes.data.current_weather;
    const temp = weather.temperature;
    const wind = weather.windspeed;
    const time = weather.time;

    // 🌍 3️⃣ Natijani shakllantirish
    return (
      `📍 <b>${name}, ${country}</b>\n` +
      `🕒 Vaqt zonasi: <b>${timezone}</b>\n\n` +
      `🌡 Harorat: <b>${temp}°C</b>\n` +
      `💨 Shamol tezligi: <b>${wind} km/soat</b>\n` +
      `🕓 Yangilangan: ${time}`
    );
  } catch (error) {
    console.error("Xatolik:", error);
    return "⚠️ Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.";
  }
}

// 🔹 Foydalanuvchi shahar yuborganda
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.trim();

  if (text.startsWith('/start')) return;

  bot.sendMessage(chatId, "🔍 Ob-havo ma'lumoti olinmoqda...");

  const weatherInfo = await getWeather(text);
  bot.sendMessage(chatId, weatherInfo, { parse_mode: "HTML" });
});

console.log("🤖 Global Weather Bot ishga tushdi...");