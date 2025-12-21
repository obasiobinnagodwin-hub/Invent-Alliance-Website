# SMTP Configuration Troubleshooting Guide

## Common Error: "We are currently experiencing technical difficulties with our email service"

This error typically indicates an SMTP authentication failure. Follow these steps to resolve it:

## Step 1: Verify Your .env.local File

Make sure you have a `.env.local` file in the root directory with the following variables:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
CONTACT_TO_EMAIL=contact@inventallianceco.com,contact@patrickogbonna.com
ACADEMY_TO_EMAIL=academy@inventallianceco.com,contact@patrickogbonna.com
```

## Step 2: Gmail App Password Setup (Most Common Issue)

If you're using Gmail, you **MUST** use an App Password, not your regular password.

### How to Generate a Gmail App Password:

1. **Enable 2-Step Verification** (Required):
   - Go to https://myaccount.google.com/security
   - Click "2-Step Verification" and follow the setup process
   - This is mandatory - you cannot create an App Password without it

2. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Select "Other (Custom name)" as the device
   - Enter a name like "Invent Alliance Website"
   - Click "Generate"
   - Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)
   - **Remove all spaces** when adding to `.env.local`

3. **Update .env.local**:
   ```bash
   SMTP_PASS=abcdefghijklmnop  # No spaces, just the 16 characters
   ```

## Step 3: Verify SMTP Settings

### For Gmail:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-16-chars
```

### For Outlook/Hotmail:
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### For Yahoo:
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

## Step 4: Restart Your Development Server

After updating `.env.local`, you **must** restart your Next.js development server:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

Environment variables are only loaded when the server starts.

## Step 5: Check Server Logs

When you submit a form, check your terminal/console for detailed error messages. Look for:
- `SMTP Authentication Error` - Indicates credential issues
- `Invalid login` or `BadCredentials` - Wrong password/App Password
- `535` error code - Authentication failure

## Step 6: Test SMTP Connection

You can test your SMTP settings by submitting a form. If it fails:
1. Check the server console for the exact error
2. Verify your App Password is correct (no spaces, all 16 characters)
3. Ensure 2-Step Verification is enabled
4. Try generating a new App Password

## Common Mistakes:

❌ **Using regular Gmail password** - Won't work, must use App Password
❌ **Not enabling 2-Step Verification** - Required for App Passwords
❌ **Including spaces in App Password** - Remove all spaces
❌ **Not restarting server** - Environment variables only load on startup
❌ **Wrong SMTP_PORT** - Use 587 for Gmail (not 465 unless using secure: true)

## Still Having Issues?

1. **Double-check your App Password**: Generate a new one and try again
2. **Verify 2-Step Verification**: Make sure it's enabled
3. **Check email format**: Ensure SMTP_USER matches your Gmail address exactly
4. **Try a different email provider**: Test with Outlook or another SMTP service
5. **Check firewall/network**: Some networks block SMTP ports

## Production Deployment

For production deployments (Vercel, Netlify, etc.):
- Add environment variables in your hosting platform's dashboard
- Never commit `.env.local` to Git (it's in .gitignore)
- Restart your application after adding/changing environment variables

