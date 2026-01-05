# Theme System Documentation

## Overview
The centralized theme system provides consistent styling across the entire application. All theme styles are defined in `theme.jsx` and can be easily reused across components.

## Location
`src/theme/theme.jsx`

## Usage

### Basic Usage

```javascript
import { useTheme } from '../theme/theme';

function MyComponent() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  
  return (
    <div className={theme.background}>
      <p className={theme.primaryColor}>Hello World</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

### Get Theme Directly

```javascript
import { getTheme } from '../theme/theme';

const darkTheme = getTheme('dark');
const lightTheme = getTheme('light');
```

### Using Component Styles

```javascript
import { useTheme, componentStyles } from '../theme/theme';

function MyComponent() {
  const { theme } = useTheme();
  
  return (
    <div>
      <button className={componentStyles.button.primary(theme)}>
        Primary Button
      </button>
      <input className={componentStyles.input(theme)} />
      <div className={componentStyles.card(theme)}>
        Card Content
      </div>
    </div>
  );
}
```

## Theme Properties

### Backgrounds
- `background` - Main background gradient
- `backgroundSecondary` - Secondary background
- `backgroundTertiary` - Tertiary background
- `containerBg` - Container background
- `containerBgSolid` - Solid container background
- `cardBg` - Card background

### Text Colors
- `primaryColor` - Primary text color
- `secondaryColor` - Secondary text color
- `accentColor` - Accent text color
- `mutedColor` - Muted text color
- `textPrimary` - Primary text
- `textSecondary` - Secondary text
- `textMuted` - Muted text

### Borders
- `borderColor` - Default border
- `borderColorLight` - Light border
- `borderColorStrong` - Strong border

### Inputs
- `inputBg` - Input background
- `inputBorder` - Input border
- `inputFocus` - Input focus state
- `inputPlaceholder` - Placeholder color

### Buttons
- `buttonBg` - Button background gradient
- `buttonHover` - Button hover state
- `buttonPrimary` - Primary button
- `buttonSecondary` - Secondary button

### Status Colors
- `errorBg`, `errorBorder`, `errorText` - Error states
- `successBg`, `successBorder`, `successText` - Success states
- `warningBg`, `warningBorder`, `warningText` - Warning states
- `infoBg`, `infoBorder`, `infoText` - Info states

### Accents
- `accentBg` - Accent background
- `accentBgSecondary` - Secondary accent
- `accentBgHover` - Accent hover

### Effects
- `gridColor` - Grid pattern
- `circuitColor` - Circuit line color
- `scanlineColor` - Scanline effect
- `glowColor` - Glow effect color
- `glowColorStrong` - Strong glow
- `shadow` - Default shadow
- `shadowStrong` - Strong shadow

### Badges
- `badgePrimary` - Primary badge
- `badgeSuccess` - Success badge
- `badgeError` - Error badge
- `badgeWarning` - Warning badge

## useTheme Hook

The `useTheme` hook provides:
- `theme` - Current theme object
- `isDarkMode` - Boolean indicating dark mode
- `toggleTheme` - Function to toggle between themes
- `setTheme` - Function to set specific theme ('dark' or 'light')
- `themeMode` - Current theme mode string

## Component Styles

Pre-built component styles for common UI elements:

### Buttons
```javascript
componentStyles.button.primary(theme)
componentStyles.button.secondary(theme)
componentStyles.button.outline(theme)
```

### Inputs
```javascript
componentStyles.input(theme)
```

### Cards
```javascript
componentStyles.card(theme)
```

### Badges
```javascript
componentStyles.badge.primary(theme)
componentStyles.badge.success(theme)
componentStyles.badge.error(theme)
componentStyles.badge.warning(theme)
```

### Alerts
```javascript
componentStyles.alert.error(theme)
componentStyles.alert.success(theme)
componentStyles.alert.warning(theme)
componentStyles.alert.info(theme)
```

## Examples

### Example 1: Simple Component
```javascript
import { useTheme } from '../theme/theme';

function SimpleCard() {
  const { theme } = useTheme();
  
  return (
    <div className={`${theme.cardBg} ${theme.borderColor} border p-4 rounded`}>
      <h2 className={theme.primaryColor}>Title</h2>
      <p className={theme.textSecondary}>Content</p>
    </div>
  );
}
```

### Example 2: Form with Theme
```javascript
import { useTheme, componentStyles } from '../theme/theme';

function ThemedForm() {
  const { theme } = useTheme();
  
  return (
    <form className={componentStyles.card(theme)}>
      <input 
        className={componentStyles.input(theme)}
        placeholder="Enter text"
      />
      <button className={componentStyles.button.primary(theme)}>
        Submit
      </button>
    </form>
  );
}
```

### Example 3: Status Messages
```javascript
import { useTheme, componentStyles } from '../theme/theme';

function StatusMessage({ type, message }) {
  const { theme } = useTheme();
  
  return (
    <div className={componentStyles.alert[type](theme)}>
      {message}
    </div>
  );
}
```

## Best Practices

1. **Always use the theme system** - Don't hardcode colors
2. **Use componentStyles for common elements** - Reduces duplication
3. **Use the useTheme hook** - Automatically handles theme persistence
4. **Test both themes** - Ensure components work in dark and light mode
5. **Extend when needed** - Add new theme properties as needed

## Adding New Theme Properties

To add new theme properties:

1. Add the property to both `dark` and `light` objects in `themeStyles`
2. Use consistent naming conventions
3. Document the new property in this README
4. Update any components that might benefit from the new property

## Theme Persistence

The theme preference is automatically saved to `localStorage` and persists across sessions. The system also respects the user's system preference if no saved preference exists.
