import AuditLogService from '../services/auditLog.service.js';

const auditRequest = (auditLogService = new AuditLogService()) => {
    return (req, res, next) => {
        const start = req?.context?.started_at_ms || Date.now();

        res.on('finish', () => {
            const durationMs = Date.now() - start;
            const statusCode = res.statusCode;
            const status = statusCode >= 400 ? 'ERROR' : 'OK';

            auditLogService.safeLog(
                auditLogService.buildRequestEntry({
                    req,
                    resStatusCode: statusCode,
                    durationMs,
                    status
                })
            );
        });

        next();
    };
};

export default auditRequest;

