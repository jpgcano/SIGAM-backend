import RulesProvider from './providers/RulesProvider.js';
import OpenAIProvider from './providers/OpenAIProvider.js';

export default class DecisionEngine {
    constructor(config) {
        this.config = config;
        this.rules = new RulesProvider();
        this.external = new OpenAIProvider({
            apiKey: config.openAiApiKey,
            model: config.openAiModel,
            timeoutMs: config.timeoutMs,
            circuitBreaker: config.circuitBreaker
        });
    }

    async classifyTicket({ descripcion }) {
        if (!this.config.enabled) {
            return this.rules.classifyTicket({ descripcion });
        }

        if (this.config.provider === 'external' && this.external.isAvailable()) {
            try {
                const r = await this.external.classifyTicket({ descripcion });
                if (r?.categoria) return r;
            } catch {
                // fallback
            }
        }

        return this.rules.classifyTicket({ descripcion });
    }

    async triageTicket({ descripcion, categoria, criticidadActivo }) {
        if (!this.config.enabled) {
            return this.rules.triageTicket({ descripcion, categoria, criticidadActivo });
        }

        if (this.config.provider === 'external' && this.external.isAvailable()) {
            try {
                const r = await this.external.triageTicket({ descripcion, categoria, criticidadActivo });
                if (r?.prioridad) return r;
            } catch {
                // fallback
            }
        }

        return this.rules.triageTicket({ descripcion, categoria, criticidadActivo });
    }
}

