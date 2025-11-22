# Getting Started with Rune

### `npm run dev`

Runs the game in Dev UI.

The page will reload when you make changes.

### `npm run upload`

Builds the game and starts upload process to Rune.

### `npm run build`

Builds the game. You can then upload it to Rune using `npx rune@latest upload`.

### `npm run lint`

Runs the validation rules. You can read about them in the [docs on server-side logic](https://developers.rune.ai/docs/advanced/server-side-logic).

### `npm run typecheck`

Verifies that TypeScript is valid.

## Min-Max Tree Visualizer

This project includes a visualizer for the min-max algorithm with alpha-beta pruning used in the Tigers and Goats game.

### Generating min_max.js

The `min_max.js` file is generated from `src/min_max.ts` and is required for the visualizer to work:
Run this command from the project root to generate `min_max.js`:
```bash
npx tsc src/min_max.ts --outDir ./ --target ESNext --module ESNext
# On Windows, you may also need to set the file as read-only:
attrib +r min_max.js
```

**Important:** `min_max.js` is a generated file and should not be edited manually. Any changes should be made to `src/min_max.ts` and then regenerate the JavaScript file using the command above.

The visualizer (`minmax-visualizer.html`) supports both Board A (23 positions) and Board B (25 positions) configurations.

## Learn More

See the [Rune docs](https://developers.rune.ai/docs/quick-start) for more info. You can also ask any questions in the [Rune Discord](https://discord.gg/rune-devs), we're happy to help!
