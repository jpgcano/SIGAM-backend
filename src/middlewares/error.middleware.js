import { getErrorCode, getErrorMessage } from '../utils/error.util.js';

function errorMiddleware(err, req, res, next) {
    const message = getErrorMessage(err);
    const code = getErrorCode(err);
    const status = err?.status || 500;

    const logPayload = {
        code,
        status,
        message,
        path: req.originalUrl,
        method: req.method
    };

    if (status >= 500) {
        console.error('Error API:', logPayload);
    } else {
        console.warn('Solicitud rechazada:', logPayload);
    }

    res.status(status).json({
        code,
        message
    });
}

export default errorMiddleware;
