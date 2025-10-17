# Supabase Email Templates for ApparelCast

This document contains all the email templates needed for Supabase authentication flows. Copy and paste these templates into your Supabase dashboard under Authentication > Email Templates.

## 1. Confirm Signup Template

**Template Name:** Confirm signup
**Subject:** Welcome to ApparelCast - Confirm Your Account

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ApparelCast</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            background-color: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #FADADD;
            margin-bottom: 10px;
        }
        .title {
            font-size: 24px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 20px;
        }
        .content {
            font-size: 16px;
            line-height: 1.6;
            color: #666;
            margin-bottom: 30px;
        }
        .button {
            display: inline-block;
            background-color: #FADADD;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #f8b5c1;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #999;
            text-align: center;
        }
        .link {
            color: #FADADD;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">ApparelCast</div>
            <h1 class="title">Welcome to ApparelCast!</h1>
        </div>
        
        <div class="content">
            <p>Hi there!</p>
            
            <p>Thank you for signing up for ApparelCast, your premier destination for quality apparel and fashion. We're excited to have you join our community!</p>
            
            <p>To complete your registration and start exploring our amazing collection of clothing, please confirm your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">Confirm Your Account</a>
            </div>
            
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p><a href="{{ .ConfirmationURL }}" class="link">{{ .ConfirmationURL }}</a></p>
            
            <p>Once confirmed, you'll be able to:</p>
            <ul>
                <li>Browse our extensive collection of apparel</li>
                <li>Save items to your wishlist</li>
                <li>Enjoy exclusive member discounts</li>
                <li>Track your orders and delivery status</li>
                <li>Access special offers and promotions</li>
            </ul>
            
            <p>If you didn't create an account with us, please ignore this email.</p>
        </div>
        
        <div class="footer">
            <p>This confirmation link will expire in 24 hours for security reasons.</p>
            <p>Need help? Contact us at <a href="mailto:support@apparelcast.shop" class="link">support@apparelcast.shop</a></p>
            <p>&copy; 2025 ApparelCast. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

---

## 2. Reset Password Template

**Template Name:** Reset password
**Subject:** Reset Your ApparelCast Password

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - ApparelCast</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            background-color: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #FADADD;
            margin-bottom: 10px;
        }
        .title {
            font-size: 24px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 20px;
        }
        .content {
            font-size: 16px;
            line-height: 1.6;
            color: #666;
            margin-bottom: 30px;
        }
        .button {
            display: inline-block;
            background-color: #FADADD;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #f8b5c1;
        }
        .security-notice {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #999;
            text-align: center;
        }
        .link {
            color: #FADADD;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">ApparelCast</div>
            <h1 class="title">Reset Your Password</h1>
        </div>
        
        <div class="content">
            <p>Hi there!</p>
            
            <p>We received a request to reset the password for your ApparelCast account. If you made this request, click the button below to create a new password:</p>
            
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">Reset Password</a>
            </div>
            
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p><a href="{{ .ConfirmationURL }}" class="link">{{ .ConfirmationURL }}</a></p>
            
            <div class="security-notice">
                <strong>Security Notice:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>This password reset link will expire in 1 hour</li>
                    <li>If you didn't request this reset, please ignore this email</li>
                    <li>Your current password will remain unchanged until you create a new one</li>
                </ul>
            </div>
            
            <p>For your security, we recommend choosing a strong password that:</p>
            <ul>
                <li>Is at least 8 characters long</li>
                <li>Contains both uppercase and lowercase letters</li>
                <li>Includes numbers and special characters</li>
                <li>Is unique to your ApparelCast account</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>If you're having trouble with your account, please contact us at <a href="mailto:support@apparelcast.shop" class="link">support@apparelcast.shop</a></p>
            <p>&copy; 2025 ApparelCast. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

---

## 3. Change Email Address Template

**Template Name:** Change email address
**Subject:** Confirm Your New Email Address - ApparelCast

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Email Change - ApparelCast</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            background-color: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #FADADD;
            margin-bottom: 10px;
        }
        .title {
            font-size: 24px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 20px;
        }
        .content {
            font-size: 16px;
            line-height: 1.6;
            color: #666;
            margin-bottom: 30px;
        }
        .button {
            display: inline-block;
            background-color: #FADADD;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #f8b5c1;
        }
        .info-box {
            background-color: #e3f2fd;
            border: 1px solid #bbdefb;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #999;
            text-align: center;
        }
        .link {
            color: #FADADD;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">ApparelCast</div>
            <h1 class="title">Confirm Your New Email</h1>
        </div>
        
        <div class="content">
            <p>Hi there!</p>
            
            <p>We received a request to change the email address associated with your ApparelCast account. To complete this change, please confirm your new email address by clicking the button below:</p>
            
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">Confirm New Email</a>
            </div>
            
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p><a href="{{ .ConfirmationURL }}" class="link">{{ .ConfirmationURL }}</a></p>
            
            <div class="info-box">
                <strong>What happens next:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Once confirmed, this will become your new login email</li>
                    <li>All future communications will be sent to this address</li>
                    <li>Your account settings and order history will remain unchanged</li>
                </ul>
            </div>
            
            <p><strong>Important:</strong> If you didn't request this email change, please contact our support team immediately at <a href="mailto:support@apparelcast.shop" class="link">support@apparelcast.shop</a> to secure your account.</p>
        </div>
        
        <div class="footer">
            <p>This confirmation link will expire in 24 hours for security reasons.</p>
            <p>Need help? Contact us at <a href="mailto:support@apparelcast.shop" class="link">support@apparelcast.shop</a></p>
            <p>&copy; 2025 ApparelCast. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

---

## 4. Magic Link Template

**Template Name:** Magic Link
**Subject:** Your ApparelCast Login Link

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Login Link - ApparelCast</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            background-color: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #FADADD;
            margin-bottom: 10px;
        }
        .title {
            font-size: 24px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 20px;
        }
        .content {
            font-size: 16px;
            line-height: 1.6;
            color: #666;
            margin-bottom: 30px;
        }
        .button {
            display: inline-block;
            background-color: #FADADD;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #f8b5c1;
        }
        .security-notice {
            background-color: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #999;
            text-align: center;
        }
        .link {
            color: #FADADD;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">ApparelCast</div>
            <h1 class="title">Your Secure Login Link</h1>
        </div>
        
        <div class="content">
            <p>Hi there!</p>
            
            <p>You requested a secure login link for your ApparelCast account. Click the button below to sign in instantly - no password required!</p>
            
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">Sign In to ApparelCast</a>
            </div>
            
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p><a href="{{ .ConfirmationURL }}" class="link">{{ .ConfirmationURL }}</a></p>
            
            <div class="security-notice">
                <strong>🔒 Security Information:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>This link will expire in 1 hour for your security</li>
                    <li>It can only be used once</li>
                    <li>Only use this link if you requested it</li>
                    <li>The link will log you in automatically</li>
                </ul>
            </div>
            
            <p>Once signed in, you'll have full access to:</p>
            <ul>
                <li>Your account dashboard and order history</li>
                <li>Saved items and wishlist</li>
                <li>Exclusive member benefits and discounts</li>
                <li>Fast and secure checkout</li>
            </ul>
            
            <p><strong>Didn't request this?</strong> If you didn't ask for this login link, you can safely ignore this email. Your account remains secure.</p>
        </div>
        
        <div class="footer">
            <p>For security reasons, this link expires in 1 hour.</p>
            <p>Need help? Contact us at <a href="mailto:support@apparelcast.shop" class="link">support@apparelcast.shop</a></p>
            <p>&copy; 2025 ApparelCast. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

---

## 5. Invite User Template

**Template Name:** Invite user
**Subject:** You're Invited to Join ApparelCast

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Join ApparelCast - Invitation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            background-color: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #FADADD;
            margin-bottom: 10px;
        }
        .title {
            font-size: 24px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 20px;
        }
        .content {
            font-size: 16px;
            line-height: 1.6;
            color: #666;
            margin-bottom: 30px;
        }
        .button {
            display: inline-block;
            background-color: #FADADD;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #f8b5c1;
        }
        .benefits {
            background-color: #fef7ff;
            border: 1px solid #f3e8ff;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #999;
            text-align: center;
        }
        .link {
            color: #FADADD;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">ApparelCast</div>
            <h1 class="title">You're Invited!</h1>
        </div>
        
        <div class="content">
            <p>Hello!</p>
            
            <p>You've been invited to join ApparelCast, the premier destination for quality apparel and fashion. We're excited to welcome you to our community of style enthusiasts!</p>
            
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">Accept Invitation</a>
            </div>
            
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p><a href="{{ .ConfirmationURL }}" class="link">{{ .ConfirmationURL }}</a></p>
            
            <div class="benefits">
                <h3 style="color: #1a1a1a; margin-top: 0;">What you'll get as a member:</h3>
                <ul style="margin: 15px 0; padding-left: 20px;">
                    <li><strong>Exclusive Access:</strong> First look at new collections and limited editions</li>
                    <li><strong>Member Discounts:</strong> Special pricing and promotional offers</li>
                    <li><strong>Personalized Experience:</strong> Curated recommendations based on your style</li>
                    <li><strong>Fast Checkout:</strong> Save your preferences for quick and easy shopping</li>
                    <li><strong>Order Tracking:</strong> Real-time updates on your purchases</li>
                    <li><strong>Wishlist:</strong> Save your favorite items for later</li>
                </ul>
            </div>
            
            <p>Discover our carefully curated collection of quality apparel. From casual wear to formal attire, we have something for every style and occasion.</p>
            
            <p><strong>Ready to get started?</strong> Click the invitation link above to create your account and start exploring our amazing collection!</p>
        </div>
        
        <div class="footer">
            <p>This invitation link will expire in 7 days.</p>
            <p>Questions? Contact us at <a href="mailto:support@apparelcast.shop" class="link">support@apparelcast.shop</a></p>
            <p>&copy; 2025 ApparelCast. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

---

## How to Use These Templates

1. **Access Supabase Dashboard:**
   - Go to your Supabase project dashboard
   - Navigate to Authentication > Email Templates

2. **For Each Template:**
   - Select the appropriate template type (Confirm signup, Reset password, etc.)
   - Replace the default content with the HTML code provided above
   - Update the subject line as specified
   - Save the changes

3. **Customization Notes:**
   - All templates use your brand colors (#FADADD for primary pink)
   - Replace `support@apparelcast.shop` with your actual support email
   - Modify any content to match your specific business needs
   - Test each template by triggering the respective authentication flow

4. **Template Variables:**
   - `{{ .ConfirmationURL }}` - Automatically populated by Supabase
   - These variables are handled by Supabase's email system
   - Do not modify the variable syntax

All templates are responsive and will look great on both desktop and mobile devices!