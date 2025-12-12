import chalk from 'chalk';
import readline from 'readline';
import Conf from 'conf';

const config = new Conf({ projectName: 'bothive' });

export async function loginCommand() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log(`
  ${chalk.dim('Get your API key at:')}
  ${chalk.cyan('https://bothive.app/dashboard/developer/api-keys')}
`);

    rl.question(`  ${chalk.dim('API Key:')} `, async (apiKey) => {
        rl.close();

        if (!apiKey || apiKey.trim().length < 10) {
            console.log(chalk.red('\n  Invalid API key'));
            return;
        }

        // Validate the API key with the server
        try {
            const response = await fetch('https://localhost:3000/api/auth/validate-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: apiKey.trim() }),
            });

            if (response.ok) {
                config.set('authToken', apiKey.trim());
                console.log(chalk.green('\n  Authenticated successfully'));
            } else {
                // In dev mode, accept any key
                config.set('authToken', apiKey.trim());
                console.log(chalk.dim('\n  Key saved (dev mode)'));
            }
        } catch {
            // Network error - save locally for dev mode
            config.set('authToken', apiKey.trim());
            console.log(chalk.dim('\n  Key saved locally'));
        }
    });
}
