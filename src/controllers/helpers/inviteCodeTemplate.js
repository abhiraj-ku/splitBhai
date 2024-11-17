function generateInviteEmailTemplate({ groupName, inviterName, inviteLink, inviteCode }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Join ${groupName} on SplitBhai</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Inter', sans-serif;
                line-height: 1.6;
                color: #333333;
            }

            .email-container {
                max-width: 600px;
                margin: 0 auto;
                padding: 40px 20px;
                background-color: #f8fafc;
            }

            .email-content {
                background-color: #ffffff;
                border-radius: 12px;
                padding: 32px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            }

            .logo {
                text-align: center;
                margin-bottom: 32px;
            }

            .logo img {
                height: 40px;
            }

            .header {
                text-align: center;
                margin-bottom: 24px;
            }

            .title {
                color: #1e293b;
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 8px;
            }

            .subtitle {
                color: #64748b;
                font-size: 16px;
            }

            .invite-code-container {
                background-color: #f1f5f9;
                border-radius: 8px;
                padding: 16px;
                text-align: center;
                margin: 24px 0;
            }

            .invite-code {
                font-family: monospace;
                font-size: 24px;
                font-weight: 600;
                color: #0f172a;
                letter-spacing: 2px;
            }

            .button {
                display: block;
                width: 100%;
                max-width: 300px;
                margin: 32px auto;
                padding: 16px 24px;
                background-color: #3b82f6;
                color: #ffffff;
                text-decoration: none;
                text-align: center;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
            }

            .button:hover {
                background-color: #2563eb;
            }

            .footer {
                text-align: center;
                margin-top: 32px;
                color: #64748b;
                font-size: 14px;
            }

            .divider {
                height: 1px;
                background-color: #e2e8f0;
                margin: 24px 0;
            }

            @media only screen and (max-width: 480px) {
                .email-content {
                    padding: 24px 16px;
                }

                .title {
                    font-size: 20px;
                }

                .invite-code {
                    font-size: 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-content">
                <div class="logo">
         
                    <img src="https://yourdomain.com/logo.png" alt="SplitBhai Logo">
                </div>
                
                <div class="header">
                    <h1 class="title">You're invited to join ${groupName}!</h1>
                    <p class="subtitle">${inviterName} has invited you to join their group on SplitBhai</p>
                </div>

                <div class="invite-code-container">
                    <p style="margin-bottom: 8px; color: #64748b;">Your invite code:</p>
                    <div class="invite-code">${inviteCode}</div>
                </div>

                <a href="${inviteLink}" class="button">
                    Join Group
                </a>

                <div class="divider"></div>

                <div style="text-align: center; color: #64748b;">
                    <p>Or copy and paste this link in your browser:</p>
                    <p style="word-break: break-all; color: #3b82f6;">${inviteLink}</p>
                </div>

                <div class="footer">
                    <p>This invitation was sent to you by SplitBhai.</p>
                    <p>If you didn't expect this invitation, you can ignore this email.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

module.exports = generateInviteEmailTemplate;
