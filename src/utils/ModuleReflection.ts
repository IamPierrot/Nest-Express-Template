import { join } from 'path';
import { readdirSync, statSync } from 'fs';
import { Type, ConsoleLogger } from '@nestjs/common';
import AppConfig from 'src/app.config';

const defaultModulePath = join(__dirname, '..', 'modules');

/**
 * Dynamically loads NestJS modules from the modules directory
 * @param modulePath Optional custom path for modules
 * @returns Array of NestJS module classes
 */
export default function ModuleReflection(
    modulePath: string = defaultModulePath,
): Type<any>[] {
    const logger = new ConsoleLogger({
        context: 'ModuleReflection',
        prefix: AppConfig.app.consolePrefix,
    });
    const modules: Type<any>[] = [];

    try {
        findModules(modulePath, modules, logger);

        logger.log(`Discovered ${modules.length} modules`);
        return modules;
    } catch (err) {
        logger.error(`Failed to read modules directory: ${err.message}`);
        return [];
    }
}

function findModules(
    dirPath: string,
    modules: Type<any>[],
    logger: ConsoleLogger,
): void {
    try {
        const entries = readdirSync(dirPath);

        const moduleFile = entries.find((file) =>
            file.match(/\.module\.(ts|js)$/i),
        );
        if (moduleFile) {
            try {
                const modulePath = join(dirPath, moduleFile);
                const moduleExport = require(modulePath);

                let moduleClass = moduleExport.default;

                if (!moduleClass) {
                    const exportedValues = Object.values(moduleExport);
                    moduleClass = exportedValues.find(
                        (value) =>
                            typeof value === 'function' ||
                            (typeof value === 'object' && value !== null),
                    );
                }

                if (moduleClass) {
                    modules.push(moduleClass);
                    logger.debug(
                        `Loaded module ${moduleClass.name} from ${dirPath.replace(/\\/g, '/').split('/').pop()}`,
                    );
                } else {
                    logger.warn(`Could not find module class in ${modulePath}`);
                }
            } catch (err) {
                logger.error(`Failed to load module: ${err.message}`);
            }
        }

        entries.forEach((entry) => {
            const entryPath = join(dirPath, entry);

            try {
                if (statSync(entryPath).isDirectory()) {
                    findModules(entryPath, modules, logger);
                }
            } catch (err) {
                logger.error(`Failed to process ${entryPath}: ${err.message}`);
            }
        });
    } catch (err) {
        logger.error(`Failed to read directory ${dirPath}: ${err.message}`);
    }
}
