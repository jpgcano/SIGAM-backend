function safeJsonParse(text) {
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

function nowMs() {
    return Date.now();
}

export default class OpenAIProvider {
    constructor({ apiKey, model, timeoutMs, circuitBreaker }) {
        this.name = 'openai_responses_v1';
        this.apiKey = apiKey;
        this.model = model;
        this.timeoutMs = timeoutMs;
        this.cb = {
            failureThreshold: circuitBreaker?.failureThreshold ?? 3,
            openMs: circuitBreaker?.openMs ?? 60000,
            failures: 0,
            openedUntil: 0
        };
    }

    isAvailable() {
        if (!this.apiKey) return false;
        return nowMs() >= this.cb.openedUntil;
    }

    recordFailure() {
        this.cb.failures += 1;
        if (this.cb.failures >= this.cb.failureThreshold) {
            this.cb.openedUntil = nowMs() + this.cb.openMs;
            this.cb.failures = 0;
        }
    }

    recordSuccess() {
        this.cb.failures = 0;
        this.cb.openedUntil = 0;
    }

    async classifyTicket({ descripcion }) {
        const result = await this.#call({
            task: 'classify',
            descripcion
        });
        return {
            categoria: result?.categoria ?? null,
            confidence: Number.isFinite(result?.confidence) ? result.confidence : null,
            rationale: result?.rationale ?? null,
            metodo: this.name
        };
    }

    async triageTicket({ descripcion, categoria, criticidadActivo }) {
        const result = await this.#call({
            task: 'triage',
            descripcion,
            categoria,
            criticidadActivo
        });
        return {
            prioridad: result?.prioridad ?? null,
            rationale: result?.rationale ?? null,
            metodo: this.name
        };
    }

    async #call(payload) {
        if (!this.isAvailable()) {
            throw new Error('OpenAI provider no disponible (circuit breaker abierto o apiKey ausente)');
        }

        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
            const system = [
                'Eres un clasificador para un sistema de tickets de soporte TI.',
                'Devuelve solo JSON válido y compacto.',
                'Valores permitidos:',
                '- categoria: Hardware | Software | Red | Eléctrico | null',
                "- prioridad: Baja | Media | Alta | Crítica | null",
                '- confidence: number 0..1 (opcional)',
                '- rationale: string corto (opcional)'
            ].join('\n');

            const prompt = JSON.stringify(payload);

            const res = await fetch('https://api.openai.com/v1/responses', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    input: [
                        { role: 'system', content: system },
                        { role: 'user', content: prompt }
                    ],
                    text: { format: { type: 'json_object' } }
                }),
                signal: controller.signal
            });

            if (!res.ok) {
                const msg = await res.text().catch(() => '');
                this.recordFailure();
                throw new Error(`OpenAI error HTTP ${res.status}: ${msg.slice(0, 200)}`);
            }

            const data = await res.json();

            const text =
                data?.output_text ??
                data?.output?.[0]?.content?.find((c) => c?.type === 'output_text')?.text ??
                null;

            const parsed = text ? safeJsonParse(text) : null;
            if (!parsed || typeof parsed !== 'object') {
                this.recordFailure();
                throw new Error('OpenAI devolvió un formato no parseable');
            }

            this.recordSuccess();
            return parsed;
        } catch (err) {
            if (String(err?.name) === 'AbortError') {
                this.recordFailure();
                throw new Error('OpenAI timeout');
            }
            throw err;
        } finally {
            clearTimeout(t);
        }
    }
}

