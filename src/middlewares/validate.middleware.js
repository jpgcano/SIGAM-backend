const validateRequired = (requiredFields = []) => {
    return (req, res, next) => {
        const missing = requiredFields.filter((field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === '');
        if (missing.length) {
            return res.status(400).json({ message: `Campos requeridos: ${missing.join(', ')}` });
        }
        next();
    };
};

module.exports = {
    validateRequired
};
