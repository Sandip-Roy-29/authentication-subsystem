import { registerUser } from "../services/auth.services.js";
import { loginUser } from "../services/auth.services.js";
import ApiResponse from "../utils/ApiResponse.js";
import { generateAccessToken } from "../utils/generateTokens.js";
import { setAuthCookies } from "../utils/setAuthCookies.js";

export const registerController = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
    
        const user = await registerUser({ name, email, password });

        const accessToken = generateAccessToken(user);

        setAuthCookies(res, accessToken);
    
        return res.status(201).json(
            ApiResponse.created({
                data:{
                    id: user._id,
                    name: user.name,
                    email: user.email
                },
                message: "User registered successfully",
                requestId: req.requestId,
            })
        );
    } catch (error) {
        next(error);
    }
};

export const loginController = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        const user = await loginUser({ email, password });

        const accessToken = generateAccessToken(user);

        setAuthCookies(res, accessToken);

        return res.status(200).json(
            ApiResponse.success({
                data:{
                    id: user._id,
                    name: user.name,
                    email: user.email
                },
                message: "User logged in successfully",
                requestId: req.requestId,
            })
        );

    } catch (error) {
        next(error);
    }
};