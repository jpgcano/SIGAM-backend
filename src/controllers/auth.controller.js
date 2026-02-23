const jwt = require('../utils/jwt'); // Usa tu utilidad de JWT

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Aquí iría tu lógica de buscar usuario en la DB
        const user = { id: 1, email, role: 'Analista' }; // Ejemplo

        // Generas el token usando tu utilidad en src/utils/jwt.js
        const token = jwt.generateToken({ id: user.id, role: user.role });

        res.status(200).json({ token, user });
    } catch (error) {
        res.status(500).json({ message: "Error en el login" });
    }
};