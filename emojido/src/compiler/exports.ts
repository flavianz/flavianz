import { compile } from "./compiler.ts";
import { execute } from "./assemble.ts";

export async function run(source: string) {
    const asm = compile(
        source.toString(),
        false,
        "code.ejo",
    );

    return await execute(asm);
}
