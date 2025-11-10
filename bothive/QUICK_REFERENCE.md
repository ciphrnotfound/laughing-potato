# Quick Reference Guide

## 🎨 Color Palette (Violet, White, Black Only)

```
Primary: violet-600 (#7c3aed)
Secondary: violet-500 (#8b5cf6)
Accent: violet-400 (#a78bfa)
Dark: violet-950 (#2e1065), black
Light: white, white/80, white/60
```

## 🔧 How to Add Theme Toggle to Navbar

```tsx
import ThemeToggle from "@/components/ThemeToggle";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between">
      {/* other nav items */}
      <ThemeToggle />
    </nav>
  );
}
```

## 🔔 Alert Usage

```tsx
import { ProfessionalAlert } from "@/components/ui/professional-alert";

const [showAlert, setShowAlert] = useState(null);

// Show alert
setShowAlert({
  type: "success", // or "error", "warning", "info"
  title: "Success!",
  message: "Operation completed successfully"
});

// Render alert
{showAlert && (
  <ProfessionalAlert
    type={showAlert.type}
    title={showAlert.title}
    message={showAlert.message}
    onClose={() => setShowAlert(null)}
  />
)}
```

## 🌓 Using Theme in Components

```tsx
import { useTheme } from "@/lib/theme-context";

export function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

## 📝 Violet Color Classes

### Backgrounds
- `bg-violet-600/10` - Light background
- `bg-violet-600/20` - Medium background
- `bg-violet-600` - Solid background

### Borders
- `border-violet-500/30` - Subtle border
- `border-violet-500/40` - Medium border
- `border-violet-400` - Bright border

### Text
- `text-violet-300` - Bright text
- `text-violet-400` - Accent text
- `text-white` - Primary text

### Shadows
- `shadow-lg shadow-violet-500/20` - Subtle glow
- `shadow-lg shadow-violet-500/30` - Medium glow
- `shadow-lg shadow-violet-500/50` - Strong glow

## 🎯 Common Patterns

### Gradient Button
```tsx
className="bg-gradient-to-r from-violet-600 via-violet-500 to-violet-700 hover:shadow-lg hover:shadow-violet-500/50"
```

### Glass Card
```tsx
className="bg-violet-600/20 border border-violet-500/40 backdrop-blur-3xl rounded-2xl shadow-lg shadow-violet-500/20"
```

### Input Field
```tsx
className="border border-violet-500/30 bg-white/5 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/40"
```

### Hover Effect
```tsx
className="group hover:bg-violet-600/20 hover:border-violet-500/60 hover:shadow-lg hover:shadow-violet-500/20"
```

## 📱 Responsive Breakpoints

```tsx
// Mobile first
className="text-sm sm:text-base md:text-lg"
className="p-4 sm:p-6 md:p-8"
className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
```

## 🎬 Animation Examples

### Fade In
```tsx
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 0.3 }}
```

### Scale
```tsx
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

### Slide
```tsx
initial={{ x: -20, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
transition={{ delay: 0.1 }}
```

## 🔍 Debugging

### Check Theme
```tsx
// In browser console
localStorage.getItem("theme")
document.documentElement.classList.contains("dark")
```

### Force Theme
```tsx
// In browser console
localStorage.setItem("theme", "dark")
document.documentElement.classList.add("dark")
```

## 📦 Dependencies

- `framer-motion` - Animations
- `lucide-react` - Icons
- `tailwindcss` - Styling
- `next` - Framework

## 🚀 Performance Tips

1. Use `transform` and `opacity` for animations (GPU accelerated)
2. Avoid animating `width`, `height`, `top`, `left`
3. Use `backdrop-blur-sm` for light blur, `backdrop-blur-3xl` for heavy
4. Limit number of animated elements on screen
5. Use `will-change` sparingly for complex animations

## ✅ Checklist for New Components

- [ ] Use violet color palette only
- [ ] Add hover effects with shine
- [ ] Ensure proper contrast ratios
- [ ] Test on mobile
- [ ] Add focus states for accessibility
- [ ] Use Framer Motion for animations
- [ ] Add proper z-index for overlays
- [ ] Test theme switching

## 🎯 Common Issues & Solutions

**Alert not showing?**
- Check z-index (should be z-[9999])
- Verify state is being set correctly
- Check if ProfessionalAlert is imported

**Theme not persisting?**
- Check localStorage is enabled
- Verify ThemeProvider wraps app
- Check browser console for errors

**Colors look wrong?**
- Verify Tailwind is configured
- Check for conflicting CSS
- Ensure violet classes are available

**Animations stuttering?**
- Use `transform` instead of position changes
- Reduce number of simultaneous animations
- Check browser performance
- Disable other animations temporarily

## 📚 Resources

- Tailwind CSS: https://tailwindcss.com
- Framer Motion: https://www.framer.com/motion
- Lucide Icons: https://lucide.dev
- Next.js: https://nextjs.org
