// api/send-invite.js (Vercel Serverless Function)
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { toEmail, toName, subject, htmlContent } = req.body;

    // Using the hardcoded key to ensure it works immediately on Vercel
    const BREVO_API_KEY = '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';

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
                    name: "AlllangChat Pro",
                    email: "bishtdepanshu321@gmail.com"
                },
                to: [{ email: toEmail, name: toName }],
                subject: subject,
                htmlContent: htmlContent
            })
        });

        const data = await response.json();

        if (response.ok) {
            return res.status(200).json({ status: true, message: 'Email sent successfully' });
        } else {
            // Log the error for debugging
            console.error('Brevo API Error:', data);
            return res.status(response.status).json({ status: false, message: `[Backend] ${data.message || 'Brevo Error'}` });
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}
