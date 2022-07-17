const jwt = require('jsonwebtoken');

exports.generateAccessToken = (userId) => {
    return jwt.sign({ userId: userId }, process.env.TOKEN_SECRET, { expiresIn: '5d', algorithm: 'HS256' })
}

exports.authorizeUser = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.status(401).json({ success: false, msg: 'token not found' });
    jwt.verify(token, process.env.TOKEN_SECRET, (err, userId) => {
        if (err) return res.status(403).json({ success: false, msg: 'authorization error' })
        req.userId = userId
        next()
    })
}