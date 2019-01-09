import jwt from 'jsonwebtoken';

export default async (req) => {
    const token = req.headers.authorization;

    try {
        const { user } = await jwt.verify(token, process.env.SECRET);
        req.user = user;
    } catch (err) {
        console.log(err);
    }

    req.next();
};