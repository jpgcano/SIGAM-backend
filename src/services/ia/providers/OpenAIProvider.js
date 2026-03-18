// Parse JSON safely and return null on failure.
function safeJsonParse(text) {
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

// Helper to get current time in ms.
function nowMs() {
    return Date.now();
}

// OpenAI Responses API provider with a simple circuit breaker.
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

    // Provider availability based on apiKey and circuit breaker state.
    isAvailable() {
        if (!this.apiKey) return false;
        return nowMs() >= this.cb.openedUntil;
    }

    // Record a failed call for the circuit breaker.
    recordFailure() {
        this.cb.failures += 1;
        if (this.cb.failures >= this.cb.failureThreshold) {
            this.cb.openedUntil = nowMs() + this.cb.openMs;
            this.cb.failures = 0;
        }
    }

    // Reset circuit breaker on success.
    recordSuccess() {
        this.cb.failures = 0;
        this.cb.openedUntil = 0;
    }

    // Classify ticket category using the external provider.
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

    // Triage ticket priority using the external provider.
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

    // Suggest solutions using the external provider.
    async suggestSolutions({ ticket, activo, candidates, maxSuggestions = 3 }) {
        const payload = {
            ticket: {
                id_ticket: ticket?.id_ticket ?? null,
                descripcion: ticket?.descripcion ?? null,
                clasificacion_nlp: ticket?.clasificacion_nlp ?? null,
                prioridad_ia: ticket?.prioridad_ia ?? null,
                estado: ticket?.estado ?? null
            },
            activo: activo || null,
            candidates: (Array.isArray(candidates) ? candidates : [])
                .slice(0, 5)
                .map((c) => ({
                    id_ticket: c?.id_ticket ?? null,
                    descripcion: c?.descripcion ?? null,
                    clasificacion_nlp: c?.clasificacion_nlp ?? null,
                    prioridad_ia: c?.prioridad_ia ?? null,
                    estado: c?.estado ?? null,
                    diagnostico: c?.diagnostico ?? null,
                    acciones_realizadas: c?.acciones_realizadas ?? null
                })),
            max_suggestions: maxSuggestions
        };

        const result = await this.#callSuggestions(payload);
        return {
            suggestions: Array.isArray(result?.suggestions) ? result.suggestions : [],
            metodo: this.name
        };
    }

    // Execute a raw call to OpenAI and parse JSON output.
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

            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: system },
                        { role: 'user', content: prompt }
                    ],
                    response_format: { type: 'json_object' }
                }),
                signal: controller.signal
            });

            if (!res.ok) {
                const msg = await res.text().catch(() => '');
                this.recordFailure();
                throw new Error(`OpenAI error HTTP ${res.status}: ${msg.slice(0, 200)}`);
            }

            const data = await res.json();

            const text = data?.choices?.[0]?.message?.content ?? null;

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

    // Execute a suggestions call to OpenAI and parse JSON output.
    async #callSuggestions(payload) {
        if (!this.isAvailable()) {
            throw new Error('OpenAI provider no disponible (circuit breaker abierto o apiKey ausente)');
        }

        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
            const system = [
                'Eres un asistente técnico de mantenimiento.',
                'Genera soluciones sugeridas basadas en el ticket y en el historial.',
                'Devuelve SOLO JSON válido y compacto con el siguiente esquema:',
                '{ "suggestions": [',
                '  { "titulo": string, "causa": string, "solucion": string, "pasos": string[], "ticket_id_origen": number|null, "confianza": number 0..1, "advertencias": string[] }',
                '] }',
                'Reglas estrictas:',
                '- SIEMPRE incluye "solucion" y al menos 2 "pasos" por sugerencia.',
                '- SIEMPRE incluye "causa" (si no se conoce, usar "Causa probable no confirmada").',
                '- Usa ticket_id_origen solo si proviene de candidates; si no hay historial, usa null.',
                '- Si falta información, propone pasos genéricos y añade advertencias claras.',
                '- Máximo max_suggestions elementos.'
            ].join('\n');

            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: system },
                        { role: 'user', content: JSON.stringify(payload) }
                    ],
                    response_format: { type: 'json_object' }
                }),
                signal: controller.signal
            });

            if (!res.ok) {
                const msg = await res.text().catch(() => '');
                this.recordFailure();
                throw new Error(`OpenAI error HTTP ${res.status}: ${msg.slice(0, 200)}`);
            }

            const data = await res.json();
            const text = data?.choices?.[0]?.message?.content ?? null;

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
