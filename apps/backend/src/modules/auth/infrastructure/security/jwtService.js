import jwt from "jsonwebtoken";

const jwtService = {

    generateAccessToken: async (user) => {

        return jwt.sign(
            {
                sub: user.id,
                role: user.role,
            },
            process.env.JWT_ACCESS_SECRET,
            {
                expiresIn: "15m",
            }
        );

    },


    generateRefreshToken: async (user) => {

        return jwt.sign(
            {
                sub: user.id,
            },
            process.env.JWT_REFRESH_SECRET,
            {
                expiresIn: "30d",
            }
        );

    },


    verifyAccessToken: async (token) => {

        return jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET
        );

    },


    verifyRefreshToken: async (token) => {

        return jwt.verify(
            token,
            process.env.JWT_REFRESH_SECRET
        );

    },

};


export { jwtService };