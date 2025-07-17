import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AppLoggerService } from "../services/app-logger.service";

export const Logger = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const appLoggerService = new AppLoggerService();
    
        let context: string;
        
        if (data) {
            context = data;
        } else {
            const handler = ctx.getHandler();
            const controllerClass = ctx.getClass();
            
            const controllerName = controllerClass.name;
            const handlerName = handler.name;
            context = `${controllerName}.${handlerName}`;
        }
        
        return appLoggerService.getLogger(context);
    },
);