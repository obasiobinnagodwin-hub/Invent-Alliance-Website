# Fixing Webpack Cache Errors

## Error: Array buffer allocation failed

This error occurs when webpack's cache system runs into memory issues. Here are solutions:

## Solution 1: Clear Cache and Restart (Recommended)

### Windows PowerShell:
```powershell
# Remove .next directory
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Remove node_modules cache
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# Restart dev server
npm run dev
```

### Or use the clean script:
```bash
npm run clean
npm run dev
```

## Solution 2: Increase Node.js Memory Limit

If the error persists, increase Node.js memory:

### Windows PowerShell:
```powershell
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

### Or create/update `.env.local`:
```env
NODE_OPTIONS=--max-old-space-size=4096
```

### Or update package.json scripts:
```json
{
  "scripts": {
    "dev": "cross-env NODE_OPTIONS=--max-old-space-size=4096 next dev"
  }
}
```

Then install cross-env:
```bash
npm install --save-dev cross-env
```

## Solution 3: Disable Webpack Cache (Temporary)

If you need a quick fix, disable webpack cache temporarily:

Create or update `next.config.ts`:
```typescript
const nextConfig = {
  // ... existing config
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.cache = false;
    }
    return config;
  },
};
```

**Note:** This will slow down builds, so only use as a temporary workaround.

## Solution 4: Check Available Memory

The error might indicate your system is low on memory:

1. Close other applications
2. Restart your computer
3. Check available RAM (should have at least 4GB free)

## Prevention

To prevent this issue:

1. **Regularly clear cache:**
   ```bash
   npm run clean
   ```

2. **Use the clean dev script:**
   ```bash
   npm run dev:clean
   ```

3. **Monitor memory usage** during development

4. **Keep Node.js updated** to latest LTS version

## If Nothing Works

1. Delete `node_modules` and reinstall:
   ```bash
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

2. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

3. Try a fresh clone of the project

