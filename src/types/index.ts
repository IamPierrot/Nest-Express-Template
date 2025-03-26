export * from './logger';

// #region Array prototype
Array.prototype.getRandom = function <T>(): T | undefined {
    const temp = [...this];
    return temp[Math.floor(Math.random() * this.length)];
};

Array.prototype.shuffle = function <T>(): Array<T> {
    for (let i = this.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this[i], this[j]] = [this[j], this[i]];
    }
    return this;
};

//#endregion

//#region String prototype
String.prototype.toTitle = function (): string {
    if (!this) return '';
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.toCapitalize = function () {
    return this.split(' ')
        .map((word) => word.toTitle())
        .join(' ');
};

String.prototype.trimIndent = function () {
    const lines = this.split('\n');
    const indentLengths = lines
        .filter((line) => line.trim().length > 0)
        .map((line) => (line.match(/^\s*/) || [''])[0].length);
    const minIndent = Math.min(...indentLengths);
    return lines
        .map((line) => line.slice(minIndent))
        .join('\n')
        .trim();
};

String.prototype.toCodeScript = function (
    type?: 'elm' | 'css' | 'js' | 'json',
) {
    return `\`\`\`${type || ''}\n${this}\n\`\`\``;
};

String.prototype.toBold = function () {
    return `**${this.replace(/\*/g, '')}**`;
};

String.prototype.toBackTick = function () {
    return `\`${this.replace(/\\`/g, '')}\``;
};

String.prototype.toItalic = function () {
    return `_${this}_`;
};

//#endregion

//#region Number prototype
Number.prototype.toSupperScript = function () {
    const superscripts = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
    return this.toString()
        .split('')
        .map((digit) => superscripts[parseInt(digit)])
        .join('');
};

//#endregion
