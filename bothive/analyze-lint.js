
const fs = require('fs');

try {
    const content = fs.readFileSync('lint_output_clean.json', 'utf8');
    let report = [];
    try {
        report = JSON.parse(content);
    } catch (e) {
        console.error("Failed to parse JSON:", e.message);
        // Try to strip BOM if present
        report = JSON.parse(content.replace(/^\uFEFF/, ''));
    }

    const summary = {};
    let totalErrors = 0;
    let totalWarnings = 0;

    report.forEach(file => {
        file.messages.forEach(msg => {
            const ruleId = msg.ruleId || 'unknown';
            if (!summary[ruleId]) {
                summary[ruleId] = { errors: 0, warnings: 0, files: new Set() };
            }
            if (msg.severity === 2) {
                summary[ruleId].errors++;
                totalErrors++;
            } else {
                summary[ruleId].warnings++;
                totalWarnings++;
            }
            summary[ruleId].files.add(file.filePath);
        });
    });

    console.log(`Total Errors: ${totalErrors}`);
    console.log(`Total Warnings: ${totalWarnings}`);
    console.log('\nBy Rule:');

    Object.entries(summary)
        .sort((a, b) => (b[1].errors + b[1].warnings) - (a[1].errors + a[1].warnings))
        .forEach(([rule, stats]) => {
            console.log(`${rule}: ${stats.errors} errors, ${stats.warnings} warnings (${stats.files.size} files)`);
        });

} catch (err) {
    console.error("Error reading file:", err);
}
