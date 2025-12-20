const { Resend } = require('resend');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
    const email = process.argv[2];
    if (!email) {
        console.error('Please provide an email address as an argument: node test-email.js user@example.com');
        process.exit(1);
    }

    console.log(`Testing Resend with API Key ending in: ...${process.env.RESEND_API_KEY.slice(-5)}`);

    try {
        const data = await resend.emails.send({
            from: 'Bothive <onboarding@resend.dev>',
            to: email,
            subject: 'Test Email from Bothive',
            html: '<strong>Resend is working correctly!</strong>'
        });

        console.log('✅ Success:', data);
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testEmail();
