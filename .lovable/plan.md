# Analysis-screen reassurance

## Goal
Make long document analysis feel visibly active and trustworthy without showing invented progress or changing processing logic.

## Changes
- Replace the state-filled progress ring with a continuously moving activity ring, so it never appears frozen.
- Add a small live “Still working” status with elapsed time phrased as time spent, not estimated completion.
- After a longer wait, show calm reassurance that detailed documents can take longer and that analysis is continuing.
- Keep genuine backend stages and the existing privacy link; do not add percentages or alter polling/API behavior.

## Validation
- Check the processing screen at mobile width for motion, readable status, and no overflow.
- Confirm failed and review states remain unchanged and the preview build passes.
