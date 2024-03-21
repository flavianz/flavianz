import { compile } from "./compiler.ts";
import { execute } from "./assemble.ts";

export async function run(source: string) {
    const asm = compile(source, false, source);
    return await execute(asm);
}
