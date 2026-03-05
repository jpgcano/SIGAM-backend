function errorMiddleware(err, req, res, next) {
    console.error('Error no controlado:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Error interno del servidor'
    });
}

export default errorMiddleware;
