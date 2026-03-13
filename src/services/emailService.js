const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY;
const SENDER_EMAIL = 'bishtdepanshu321@gmail.com';
const SENDER_NAME = 'AlllangChat Pro';

/**
 * Sends a transactional email using Brevo (formerly Sendinblue) API
 * @param {string} toEmail - Recipient's email
 * @param {string} toName - Recipient's name
 * @param {string} subject - Email subject
 * @param {string} htmlContent - Email content in HTML
 * @returns {Promise<{status: boolean, message: string}>}
 */
export const sendEmail = async (toEmail, toName, subject, htmlContent) => {
    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: SENDER_NAME,
                    email: SENDER_EMAIL
                },
                to: [
                    {
                        email: toEmail,
                        name: toName
                    }
                ],
                subject: subject,
                htmlContent: htmlContent
            })
        });

        const data = await response.json();

        if (response.ok) {
            return { status: true, message: 'Email sent successfully', data };
        } else {
            console.error('Brevo API Error:', data);
            return { status: false, message: data.message || 'Failed to send email' };
        }
    } catch (error) {
        console.error('Email service Error:', error);
        return { status: false, message: error.message || 'An unexpected error occurred' };
    }
};

export const generateInviteEmailTemplate = (toName, senderName, inviteLink) => {
    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; border-radius: 20px 20px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">AlllangChat Pro</h1>
                <p style="color: rgba(255,255,255,0.9); margin-top: 10px; font-size: 16px;">You've been invited to the future of AI!</p>
            </div>
            
            <div style="padding: 40px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 20px 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <p style="font-size: 18px; line-height: 1.6; margin-bottom: 24px;">Hi <strong>${toName}</strong>,</p>
                
                <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 24px;">
                    <strong>${senderName}</strong> is enjoying <strong>AlllangChat Pro</strong> and wants to share the experience with you. They've invited you to join our Pro tier at no cost!
                </p>
                
                <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 30px; border: 1px dashed #d1d5db;">
                    <h4 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em;">Pro Benefits Included:</h4>
                    <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 15px;">
                        <li style="margin-bottom: 8px;">Unlimited high-speed queries</li>
                        <li style="margin-bottom: 8px;">Premium Indian Language models</li>
                        <li style="margin-bottom: 8px;">Priority support and early access features</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin-bottom: 30px;">
                    <a href="${inviteLink}" style="display: inline-block; background-color: #10b981; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3); transition: all 0.2s ease;">
                        Claim Your Pro Access
                    </a>
                </div>
                
                <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                    If the button doesn't work, copy this link: <br/>
                    <a href="${inviteLink}" style="color: #10b981;">${inviteLink}</a>
                </p>
                
                <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 30px 0;"/>
                
                <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 0;">
                    Sent with ❤️ from <strong>AlllangChat</strong>
                </p>
            </div>
            
            <div style="text-align: center; padding: 20px; font-size: 12px; color: #9ca3af;">
                &copy; ${new Date().getFullYear()} AlllangChat. All rights reserved.
            </div>
        </div>
    `;
};
