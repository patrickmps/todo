import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import jwt, { JwtPayload } from "jsonwebtoken";
import { info, error as logError } from "./logger";

const prisma = new PrismaClient();

// Middleware para logar informações das requisições
const requestLogger = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	info("Method:", req.method);
	info("Path:  ", req.path);
	info("Body:  ", req.body?.title); // Verifica a existência de req.body e req.body.title
	info("---");
	next();
};

// Middleware para tratar endpoints desconhecidos
const unknownEndpoint = (req: Request, res: Response): void => {
	res.status(404).send({ error: "unknown endpoint" });
};

interface CustomRequest extends Request {
	token?: string;
	user?: {
		id: string;
		email: string;
		passwordHash: string;
		name: string | null;
	} | null;
}

// Middleware para extrair o token do cabeçalho de autorização
const tokenExtractor = (
	req: CustomRequest,
	res: Response,
	next: NextFunction
): void => {
	const authorization = req.get("authorization");
	if (authorization && authorization.startsWith("Bearer ")) {
		req.token = authorization.replace("Bearer ", "");
	}
	next();
};

// Middleware para extrair o usuário baseado no token JWT
const userExtractor = async (
	req: CustomRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const authorization = req.get("authorization");
	if (authorization && authorization.startsWith("Bearer ")) {
		try {
			const token = authorization.replace("Bearer ", "");
			const secret = process.env.SECRET;
			if (!secret) {
				throw new Error("Failed to sign JWT");
			}
			const decodedToken = jwt.verify(token, secret) as JwtPayload;
			if (!decodedToken.id) {
				res.status(401).json({ error: "token invalid" });
				return;
			}
			req.user = await prisma.user.findUnique({
				where: { id: decodedToken.id },
			});
		} catch (err) {
			next(err);
			return;
		}
	}
	next();
};

const auth = async (
	req: CustomRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const secret = process.env.SECRET;
		if (!secret) {
			throw new Error("Failed to sign JWT");
		}
		const decodedToken = jwt.verify(req.token!, secret) as JwtPayload;
		if (!decodedToken.id) {
			throw new Error("token invalid");
		}
		next();
	} catch (err) {
		next(err);
		return;
	}
};

// Middleware para tratar erros
const errorHandler = (
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	logError(err.message);

	if (err.name === "CastError") {
		res.status(400).send({ error: "malformatted id" });
	} else if (err.name === "ValidationError") {
		res.status(400).json({ error: err.message });
	} else if (err.name === "JsonWebTokenError") {
		res.status(401).json({ error: "invalid token" });
	} else if (err.name === "TokenExpiredError") {
		res.status(401).json({ error: "token expired" });
	} else {
		next(err);
	}
};

export {
	requestLogger,
	unknownEndpoint,
	tokenExtractor,
	userExtractor,
	errorHandler,
	auth,
};
