const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// --- POSTGRESQL VA BARCHA API'LAR OLIB TASHLANDI ---
// Endi ma'lumotlar bazasi so'rovlari to'g'ridan-to'g'ri Firebase Firestore orqali frontend'dan bajariladi.

// --- FRONTEND (REACT) FAYLLARINI XAVFSIZ ULASH ---
const distPath = path.join(__dirname, 'dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send("EduPulse Server ishlamoqda! (Frontend dist papkasi topilmadi, iltimos npm run build qiling)");
  });
}

// PORT ni Railway yoki boshqa hosting beradigan portga moslash
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server ${PORT}-portda muvaffaqiyatli ishga tushdi!`);
});