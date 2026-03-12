import jwt from 'jsonwebtoken';

const optionalAuth = (req, _res, next) => {
    const authHeader = req.headers?.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return next();

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    } catch {
        // Token inválido: se ignora para endpoints opcionales
    }
    next();
};

export default optionalAuth;

