exports.handleError = (error, res) => {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  };
  