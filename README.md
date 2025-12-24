# 🎂 Birthday Website for Mithila

A romantic, interactive birthday website featuring a cinematic video experience, 3D gift box with touch controls, and a personalized love letter.

## ✨ Features

- **Cinematic Video Experience**: 16-second birthday video with synchronized background music
- **Interactive 3D Gift Box**: Touch and rotate the gift box with photos on all four sides
- **Personalized Love Letter**: Heartfelt Free Fire themed message
- **Touch Controls**: OrbitControls for mobile and desktop interaction
- **Smooth Transitions**: Elegant animations between sections
- **Mobile Optimized**: Specifically optimized for Redmi Note 14 and AMOLED displays
- **Haptic Feedback**: Tactile vibrations on mobile devices

## 🚀 Quick Start

1. Clone the repository:
```bash
git clone https://github.com/nubruu/bday.git
cd bday
```

2. Start a local server:
```bash
python -m http.server 8000
# or
npx serve
```

3. Open in browser:
```
http://localhost:8000
```

## 📁 Project Structure

```
bday/
├── index.html          # Main HTML structure
├── style.css           # Styling and animations
├── script.js           # Main orchestration and video logic
├── gift-box.js         # 3D gift box with Three.js
├── candle.mp4          # Birthday video (16 seconds)
├── img1.jpeg           # Photo for gift box side 1
├── img2.jpeg           # Photo for gift box side 2
├── img3.jpeg           # Photo for gift box side 3
└── img4.jpeg           # Photo for gift box side 4
```

## 🎨 Technologies Used

- **Three.js**: 3D graphics and animations
- **OrbitControls**: Touch/drag rotation
- **Vanilla JavaScript**: Core functionality
- **CSS3**: Animations and transitions
- **HTML5 Video**: Cinematic playback

## 💝 Personalization

The website includes a personalized Free Fire themed love letter. To customize:
1. Edit the love letter content in `index.html` (lines 62-83)
2. Replace photos: `img1.jpeg`, `img2.jpeg`, `img3.jpeg`, `img4.jpeg`
3. Replace video: `candle.mp4` (update duration in `script.js` line 85 if needed)

## 🎮 Controls

- **Desktop**: Click and drag to rotate the gift box, scroll to zoom
- **Mobile**: Touch and drag to rotate, pinch to zoom
- **Click/Tap**: Click the gift box to open it and reveal the letter

## 📱 Mobile Optimization

Optimized for:
- Redmi Note 14 (20:9 aspect ratio)
- AMOLED displays (theme-color: #0a0515)
- Touch interactions
- Reduced motion on low-power mode

## 🎁 Made with Love

Created for Mithila's birthday with love and Three.js magic ❤️
