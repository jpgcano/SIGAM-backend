import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    // 1. Obtener el token del header 'Authorization'
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Extrae el token después de 'Bearer'

    if (!token) {
        return res.status(401).json({ message: "Acceso denegado: Token no proporcionado" });
    }

    try {
        // 2. Verificar el token con la clave secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Guardar los datos del usuario (id, role) en el objeto 'req'
        // Esto permite que el siguiente middleware (el de roles) sepa quién eres
        req.user = decoded;
        
        next(); // Continuar
    } catch (error) {
        return res.status(401).json({ message: "Token no válido o expirado" });
    }
};

export default authMiddleware;
