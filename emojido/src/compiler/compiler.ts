import { Tokenizer } from "./tokenization";
import { demoji } from "./demoji";
import { Parser } from "./parser";
import { Generator } from "./generator";
import { assemblify, Optimizer } from "./optimizer";

/**compile emojido source code to nasm asm
 *
 * @param {string} source the source code
 * @param debug
 * @param file
 * @returns {string} the asm
 * */
export function compile(source: string, debug: boolean, file: string): string {
    const start = Date.now();
    source = demoji(source);
    const tokenizer = new Tokenizer(source, file);
    const tokens = tokenizer.tokenize();
    console.log("hello");

    const parser = new Parser(tokens);
    const program = parser.parseProgram();
    console.log("world");
    const generator = new Generator(program);
    const asm = generator.generateProgram();
    console.log("nigA");
    let assemblyTokens = asm.text;

    if (!debug) {
        const optimizer = new Optimizer(assemblyTokens);
        assemblyTokens = optimizer.optimize();
    }

    const text = assemblify(assemblyTokens);

    console.log(
        `Compiled in ${Date.now() - start} ms\nFetching execution results...\n\n`,
    );

    return (
        "section .data\n" +
        asm.data +
        "section .bss\n" +
        asm.bss +
        "\nsection .text\n    global _start\n_start:\n" +
        text +
        asm.routines
    );
}
