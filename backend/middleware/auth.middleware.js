const jwt=require('jsonwebtoken');
const verifyToken=(req,res,next)=>{

    //get token from header
    const token=req.headers['authorization'];
    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Access denied. No token provided.' });
    }
    const jwtToken = token.split(' ')[1];
    try {

        //verify the token
        const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
        
        //attach user information to the request object
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid token.' });
    }
};
module.exports = verifyToken;