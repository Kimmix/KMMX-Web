# Story Act IntersectionObserver Update

## Summary
Updated the story-act cards from CSS `:hover` effects to IntersectionObserver-based animations that trigger when elements enter the viewport.

## Changes Made

### 1. CSS Updates (`assets/css/story.css`)
All hover states now support both `:hover` and `.revealed` class:

- `.story-act:hover` → `.story-act:hover, .story-act.revealed`
- `.story-act:hover::before` → `.story-act:hover::before, .story-act.revealed::before`
- `.story-act:hover::after` → `.story-act:hover::after, .story-act.revealed::after`
- And similar updates for all child elements (images, overlays, content, headers, etc.)

**Benefits:**
- Elements still work with hover for desktop users
- Automatically reveal when scrolled into view
- Better mobile experience (no need to tap)
- More accessible for users

### 2. JavaScript Implementation (`js/main.js`)

Added new `setupStoryReveal()` function that:
- Uses IntersectionObserver API for efficient viewport detection
- **Only reveals the card when it's centered on screen** (middle 20% of viewport)
- Triggers when 50% of the card is visible in the center zone
- **Automatically fades out when card leaves the center** (reversible animation)
- Only one card is revealed at a time
- Properly integrated into the DOMContentLoaded initialization sequence

**Configuration Options:**
```javascript
const observerOptions = {
    root: null,                          // viewport
    rootMargin: '-40% 0px -40% 0px',    // Center 20% zone (adjust for different center size)
    threshold: 0.5                       // 50% visibility required
};
```

### Customization Options

#### Adjust the center zone size
Change the `rootMargin` values to make the center zone bigger or smaller:
```javascript
rootMargin: '-40% 0px -40% 0px'  // Center 20% (default)
rootMargin: '-30% 0px -30% 0px'  // Center 40% (bigger zone)
rootMargin: '-45% 0px -45% 0px'  // Center 10% (smaller zone - more precise)
```

#### Adjust visibility threshold
Change how much of the card must be visible:
```javascript
threshold: 0.5   // 50% visible (default)
threshold: 0.3   // 30% visible (triggers easier)
threshold: 0.7   // 70% visible (triggers harder)
```

#### Allow multiple cards revealed at once
Remove the code that clears other cards:
```javascript
// Comment out or remove this section:
storyActs.forEach(act => {
    if (act !== entry.target) {
        act.classList.remove('revealed');
    }
});
```

## Browser Support
IntersectionObserver is supported in all modern browsers:
- Chrome 51+
- Firefox 55+
- Safari 12.1+
- Edge 15+

## Testing

1. Scroll to the story section
2. **Only the card in the center of the viewport should reveal**
3. As you scroll, each card reveals when it reaches the center
4. **Cards automatically fade out when they leave the center zone**
5. Hover still works on desktop for manual reveal
6. Only one card is revealed at a time

## Performance
IntersectionObserver is highly performant:
- No scroll event listeners
- Native browser API
- Efficient viewport calculations
- Minimal JavaScript execution
