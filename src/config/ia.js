function parseBool(value, defaultValue = false) {
    if (value === undefined) return defaultValue;
    const v = String(value).trim().toLowerCase();
    if (['1', 'true', 'yes', 'y', 'on'].includes(v)) return true;
    if (['0', 'false', 'no', 'n', 'off'].includes(v)) return false;
    return defaultValue;
}

function parseIntEnv(value, defaultValue) {
    if (value === undefined) return defaultValue;
    const n = Number.parseInt(String(value), 10);
    return Number.isFinite(n) ? n : defaultValue;
}

export function getIaConfig() {
    const provider = (process.env.IA_PROVIDER || 'rules').trim().toLowerCase();
    return {
        enabled: parseBool(process.env.IA_ENABLED, true),
        provider: provider === 'external' ? 'external' : 'rules',
        assignmentEnabled: parseBool(process.env.IA_ASSIGNMENT_ENABLED, true),
        timeoutMs: parseIntEnv(process.env.IA_TIMEOUT_MS, 2500),
        openAiApiKey: process.env.API_IA || null,
        openAiModel: process.env.IA_MODEL || 'gpt-4o-mini',
        circuitBreaker: {
            failureThreshold: parseIntEnv(process.env.IA_CB_FAILURE_THRESHOLD, 3),
            openMs: parseIntEnv(process.env.IA_CB_OPEN_MS, 60000)
        }
    };
}

