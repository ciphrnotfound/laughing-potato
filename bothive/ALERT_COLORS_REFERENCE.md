# Alert Colors & Animations Reference

## 🎨 Alert Color Scheme

### Success Alert (Green)
```
Icon Color: text-green-400
Background: bg-gradient-to-br from-green-600/20 to-green-700/10
Border: border-green-500/40
Glow: shadow-lg shadow-green-500/20
Progress Bar: bg-green-500
Accent Gradient: from-green-500/0 via-green-500/20 to-green-500/0
```

### Error Alert (Red)
```
Icon Color: text-red-400
Background: bg-gradient-to-br from-red-600/20 to-red-700/10
Border: border-red-500/40
Glow: shadow-lg shadow-red-500/20
Progress Bar: bg-red-500
Accent Gradient: from-red-500/0 via-red-500/20 to-red-500/0
```

### Warning Alert (Yellow)
```
Icon Color: text-yellow-400
Background: bg-gradient-to-br from-yellow-600/20 to-yellow-700/10
Border: border-yellow-500/40
Glow: shadow-lg shadow-yellow-500/20
Progress Bar: bg-yellow-500
Accent Gradient: from-yellow-500/0 via-yellow-500/20 to-yellow-500/0
```

### Info Alert (Blue)
```
Icon Color: text-blue-400
Background: bg-gradient-to-br from-blue-600/20 to-blue-700/10
Border: border-blue-500/40
Glow: shadow-lg shadow-blue-500/20
Progress Bar: bg-blue-500
Accent Gradient: from-blue-500/0 via-blue-500/20 to-blue-500/0
```

---

## ✨ Animation Details

### Pulsing Background
- **Duration**: 3 seconds
- **Cycle**: 0.3 opacity → 0.6 opacity → 0.3 opacity
- **Repeat**: Infinite
- **Easing**: ease-in-out (default)

### Animated Icon
- **Duration**: 2 seconds
- **Scale**: 1 → 1.1 → 1
- **Repeat**: Infinite
- **Easing**: ease-in-out (default)

### Progress Bar
- **Duration**: Matches alert duration (default 5000ms)
- **Animation**: Linear width decrease
- **Start**: 100%
- **End**: 0%
- **Easing**: linear

### Entrance Animation
- **Type**: Spring
- **Damping**: 20
- **Stiffness**: 300
- **Initial**: scale 0.8, opacity 0, y -20
- **Animate**: scale 1, opacity 1, y 0

### Exit Animation
- **Type**: Spring
- **Damping**: 20
- **Stiffness**: 300
- **Exit**: scale 0.8, opacity 0, y -20

---

## 🎯 Usage Examples

### Success Alert
```tsx
setShowAlert({
  type: "success",
  title: "Success!",
  message: "Operation completed successfully.",
  duration: 5000
});
```

### Error Alert
```tsx
setShowAlert({
  type: "error",
  title: "Error",
  message: "Something went wrong. Please try again.",
  duration: 5000
});
```

### Warning Alert
```tsx
setShowAlert({
  type: "warning",
  title: "Warning",
  message: "Please review before proceeding.",
  duration: 5000
});
```

### Info Alert
```tsx
setShowAlert({
  type: "info",
  title: "Information",
  message: "Here's some helpful information.",
  duration: 5000
});
```

---

## 🔧 Customization

### Change Duration
```tsx
<ProfessionalAlert
  type="success"
  title="Success"
  message="Done!"
  duration={3000}  // 3 seconds instead of 5
  onClose={() => setShowAlert(null)}
/>
```

### Custom Colors
To add custom colors, modify the `typeConfig` object in `professional-alert.tsx`:

```tsx
const typeConfig = {
  custom: {
    icon: <CustomIcon className="h-6 w-6 text-custom-400" />,
    bg: "bg-gradient-to-br from-custom-600/20 to-custom-700/10",
    border: "border-custom-500/40",
    glow: "shadow-lg shadow-custom-500/20",
    accent: "from-custom-500/0 via-custom-500/20 to-custom-500/0",
  }
};
```

---

## 📊 Visual Hierarchy

### Alert Container
- Rounded: `rounded-3xl`
- Border: Color-specific
- Background: Gradient with transparency
- Backdrop: `backdrop-blur-3xl`
- Shadow: Color-specific glow

### Icon
- Size: `h-6 w-6`
- Color: Color-specific
- Animation: Pulsing scale

### Title
- Font: `font-bold text-lg`
- Color: `text-white`

### Message
- Font: `text-sm`
- Color: `text-white/80`

### Progress Bar
- Height: `h-1`
- Position: Bottom
- Color: Color-specific

---

## 🎬 Animation Timeline

### Alert Lifecycle
1. **0ms**: Entrance animation starts
2. **300-400ms**: Alert fully visible
3. **400ms-4600ms**: Pulsing + icon animations
4. **4600ms**: Progress bar near completion
5. **5000ms**: Auto-dismiss starts
6. **5100-5200ms**: Exit animation complete

---

## 🌈 Color Palette Reference

```
Green (Success):
  - Icon: #4ade80 (green-400)
  - Background: rgba(22, 163, 74, 0.2) to rgba(15, 118, 110, 0.1)
  - Border: rgba(34, 197, 94, 0.4)
  - Progress: #22c55e (green-500)

Red (Error):
  - Icon: #f87171 (red-400)
  - Background: rgba(220, 38, 38, 0.2) to rgba(153, 27, 27, 0.1)
  - Border: rgba(239, 68, 68, 0.4)
  - Progress: #ef4444 (red-500)

Yellow (Warning):
  - Icon: #facc15 (yellow-400)
  - Background: rgba(202, 138, 4, 0.2) to rgba(161, 98, 7, 0.1)
  - Border: rgba(234, 179, 8, 0.4)
  - Progress: #eab308 (yellow-500)

Blue (Info):
  - Icon: #60a5fa (blue-400)
  - Background: rgba(37, 99, 235, 0.2) to rgba(30, 64, 175, 0.1)
  - Border: rgba(59, 130, 246, 0.4)
  - Progress: #3b82f6 (blue-500)
```

---

## 💡 Tips

1. **Keep messages short** - Better readability
2. **Use appropriate types** - Helps users understand context
3. **Adjust duration** - Longer for important messages
4. **Test animations** - Ensure smooth performance
5. **Accessibility** - Alerts are announced to screen readers

---

## 🚀 Performance Notes

- All animations use GPU acceleration
- Progress bar uses linear easing for smooth countdown
- Icon scale animation is efficient
- Background pulse is optimized
- No layout shifts during animation
