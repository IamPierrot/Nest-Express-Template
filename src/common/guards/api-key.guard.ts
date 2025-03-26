import { CanActivate, ExecutionContext, Global, Injectable, Scope } from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";

@Injectable()
@Global()
export default class ApiKeyGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest() satisfies Request;
        const authHeader = request.header('Authorization');
        
        if (!authHeader) return false;
        
        const apiKey = authHeader.startsWith("ApiKey ") ? authHeader.substring('ApiKey '.length) : authHeader;
        
        return apiKey === process.env.API_KEY;
    }

}