# Logger Decorator

The `@Logger()` decorator provides a convenient way to inject a contextual logger instance into your controller methods using the `AppLoggerService`.

## Usage

### Basic Usage (Auto-detected Context)

```typescript
import { Controller, Get } from '@nestjs/common';
import { LoggerService } from '@nestjs/common';
import { Logger } from '../../common/decorators/logger.decorator';

@Controller('example')
export class ExampleController {
    @Get()
    example(@Logger() logger: LoggerService) {
        // Context will be automatically set to "ExampleController.example"
        logger.log('This is a log message');
        logger.error('This is an error message');
        logger.warn('This is a warning message');
        
        return { message: 'Hello World' };
    }
}
```

### Custom Context

```typescript
import { Controller, Get } from '@nestjs/common';
import { LoggerService } from '@nestjs/common';
import { Logger } from '../../common/decorators/logger.decorator';

@Controller('example')
export class ExampleController {
    @Get('custom')
    customExample(@Logger('CustomContext') logger: LoggerService) {
        // Context will be set to "CustomContext"
        logger.log('This is a log message with custom context');
        
        return { message: 'Hello World' };
    }
}
```

## Features

- **Auto-detected Context**: When no parameter is provided, the decorator automatically creates a context using the format `ControllerName.MethodName`
- **Custom Context**: You can provide a custom context string as a parameter
- **Leverages AppLoggerService**: Uses the centralized `AppLoggerService` with consistent formatting and prefixes
- **Type Safety**: Returns a properly typed `LoggerService` instance

## Benefits

1. **Consistency**: All logs use the same formatting and configuration from `AppLoggerService`
2. **Convenience**: No need to manually inject or instantiate logger services
3. **Context Awareness**: Automatically provides meaningful context for debugging
4. **Performance**: Reuses logger instances through the `AppLoggerService` caching mechanism

## Example Output

When using the decorator, your logs will appear with the configured prefix and context:

```
[MyApp] [ExampleController.example] This is a log message
[MyApp] [CustomContext] This is a log message with custom context
```
