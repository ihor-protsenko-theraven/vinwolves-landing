export default async function handler(req, res) {
    // 1. Validate Request Method
    if (req.method !== 'POST') {
        return res.status(405).json({
            status: 'error',
            message: 'Method Not Allowed. Use POST.'
        });
    }

    // 2. Read Credentials from Environment Variables (Destructuring)
    const { TG_BOT_TOKEN, TG_CHAT_ID } = process.env;

    // Check configuration
    if (!TG_BOT_TOKEN || !TG_CHAT_ID) {
        console.error('❌ Server Config Error: Missing Telegram Credentials');
        return res.status(500).json({
            status: 'error',
            message: 'Server Configuration Error'
        });
    }

    try {
        // 3. Parse Request Body
        const { name, phone } = req.body;

        if (!name || !phone) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields: name or phone'
            });
        }

        // 4. Construct Message
        const message = `🐺 *НОВА ЗАЯВКА З ЛЕНДІНГУ* (Vercel) \n\n` +
            `👤 *Ім'я:* ${name}\n` +
            `📞 *Телефон:* ${phone}\n\n` +
            `⏰ *Час:* ${new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kiev' })}`;

        // 5. Send to Telegram API
        const telegramUrl = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`;

        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TG_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        const telegramData = await response.json();

        if (!response.ok) {
            console.error('❌ Telegram API Error:', telegramData);
            throw new Error(`Telegram API responded with ${response.status}: ${telegramData.description}`);
        }

        // 6. Return Success Response
        return res.status(200).json({
            status: 'success',
            message: 'Message sent to Telegram successfully'
        });

    } catch (error) {
        console.error('❌ Server Handler Error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to process request'
        });
    }
}
