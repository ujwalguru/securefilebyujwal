# Design Guidelines for Secure File-Sharing Service

## Design Approach
**Reference-Based Approach**: Drawing inspiration from modern file-sharing platforms like Dropbox and WeTransfer, combined with security-focused applications like Signal for trust indicators.

## Core Design Elements

### A. Color Palette
**Dark Mode Primary** (as specified by user):
- Primary: 271 100% 26% (Dark Purple #4B0082)
- Secondary: 271 92% 42% (Medium Purple #6A0DAD)
- Background: 271 15% 8% (Very Dark Purple)
- Surface: 271 20% 12% (Dark Surface)
- Text Primary: 0 0% 95% (Near White)
- Text Secondary: 0 0% 70% (Light Gray)
- Success: 142 71% 45% (Green for encryption success)
- Error: 0 84% 60% (Red for failed decryption)
- Warning: 38 92% 50% (Amber for weak patterns)

### B. Typography
- Primary: Inter (Google Fonts) - clean, modern readability
- Monospace: JetBrains Mono for file names and encryption keys
- Hierarchy: h1 (2.5rem), h2 (2rem), h3 (1.5rem), body (1rem), small (0.875rem)

### C. Layout System
**Tailwind Spacing Units**: Consistent use of 4, 8, 12, 16, 24 units
- Micro spacing: p-4, m-4 (16px)
- Component spacing: p-8, m-8 (32px)
- Section spacing: p-12, m-12 (48px)

### D. Component Library

**Pattern Grid (3×3)**:
- Interactive dots with smooth scale animations
- Connected lines that draw progressively
- Subtle glow effects on active connections
- Visual feedback for pattern strength

**File Upload Zone**:
- Large drag-and-drop area with dotted border
- Progress indicators with purple gradient fills
- File preview cards with encryption status badges

**File Dashboard/Table**:
- Clean table with subtle hover effects
- Download buttons with loading states
- File type icons and size formatting
- Smooth row animations for new uploads

**Security Indicators**:
- Encryption strength meters
- Lock icons for encrypted files
- Visual confirmation of successful operations

**Navigation & Modals**:
- Minimal top navigation
- Overlay modals with backdrop blur
- Toast notifications for status updates

### E. Visual Treatments

**Gradients**: Subtle purple gradients (271 100% 26% to 271 92% 42%) for:
- Button backgrounds
- Progress bars
- Pattern connection lines
- Success state overlays

**Animations**: Minimal and purposeful:
- Pattern drawing animations
- File upload progress
- Table row fade-ins
- Button hover states (built-in)
- Modal transitions

**Backgrounds**: Dark purple foundation with subtle texture through varying opacity levels

## Key Design Principles

1. **Security-First Visual Language**: Use visual cues that reinforce security and encryption
2. **Progressive Disclosure**: Reveal complexity gradually through the encryption/decryption flow
3. **Trust Indicators**: Clear visual feedback for encryption status and file integrity
4. **Minimal Cognitive Load**: Clean interface focused on core file-sharing tasks
5. **Responsive Mobile-First**: Optimized for touch interactions on mobile devices

## Critical UX Considerations

- Pattern input must feel intuitive and responsive
- File upload progress clearly communicated
- Encryption/decryption status always visible
- Error states provide clear guidance
- Success states build user confidence in security

## Footer Requirement
**Mandatory footer text**: "Made by Ujwal Guru" - positioned at bottom of all pages with subtle styling

This design creates a professional, security-focused file-sharing experience that balances sophisticated encryption capabilities with an approachable user interface.