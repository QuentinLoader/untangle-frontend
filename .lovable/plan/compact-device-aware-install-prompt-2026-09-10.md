# Compact device-aware install prompt

## Changes
- Remove the large Android and iPhone install section from the landing page.
- Add the same compact install pattern used in CaseIQ: detect iPhone/iPad automatically, use the browser install prompt on supported Android devices, hide it when already installed, and allow dismissal.
- Keep the prompt subtle, finger-friendly, and branded with Untangle’s leaf.
- Add manifest-only home-screen support and app icons; do not add offline caching or change any backend behavior.
- Keep `/` as the landing page for signed-out visitors and Home for signed-in visitors.

## Verification
- Check the custom-domain root behavior in code.
- Verify mobile and desktop rendering, install-prompt states, type safety, and preview build health.
