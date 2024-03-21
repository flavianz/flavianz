import { LineCount, LiteralType, Token, TokenType, VarFunction } from "./types";
import { error, getBinaryPrecedence, Tokenizer } from "./tokenization";
import { mergeMaps } from "./utils";
import {
    Term,
    TermArray,
    TermArrayAccess,
    TermBoolean,
    TermFloat,
    TermIdentifier,
    TermInteger,
    TermMemoryAccess,
    TermNull,
    TermObject,
    TermParens,
    TermParseToFloat,
    TermParseToInt,
    TermParseToString,
    TermPointer,
    TermString,
} from "./classes/Terms";
import { Expression } from "./classes/Expressions";
import {
    ElseIfPredicate,
    ElsePredicate,
    IfPredicate,
} from "./classes/IfPredicates";
import { Scope } from "./classes/Scope";
import {
    Statement,
    StatementAssembly,
    StatementAssign,
    StatementExit,
    StatementFor,
    StatementIf,
    StatementImport,
    StatementLet,
    StatementMemoryModification,
    StatementPrint,
    StatementReturn,
    StatementTerm,
    StatementWhile,
} from "./classes/Statements";
import {
    BinaryExpression,
    BinaryExpressionAdd,
    BinaryExpressionDiv,
    BinaryExpressionMul,
    BinaryExpressionSub,
    BooleanBinaryExpressionAnd,
    BooleanBinaryExpressionCompare,
    BooleanBinaryExpressionGreaterEquals,
    BooleanBinaryExpressionGreaterThan,
    BooleanBinaryExpressionLessEquals,
    BooleanBinaryExpressionLessThan,
    BooleanBinaryExpressionNotCompare,
    BooleanBinaryExpressionOr,
    BooleanBinaryExpressionXor,
} from "./classes/BinaryExpressions";
import { Program } from "./classes/Program";
import {
    FunctionArgument,
    StatementFunctionDefinition,
    TermFunctionCall,
} from "./classes/Functions";
import fs from "node:fs";
import { demoji } from "./demoji";

const literalTypeToEmoji = {
    [LiteralType.integerLiteral]: "🔢",
    [LiteralType.floatLiteral]: "🧮",
    [LiteralType.stringLiteral]: "📜",
    [LiteralType.booleanLiteral]: "⚜️",
    [LiteralType.nullLiteral]: "🫥",
};

export function getEmojiFromLiteralType(literalType: LiteralType) {
    return literalTypeToEmoji[literalType];
}

export function getLiteralTypeFromTokenType(tokenType: TokenType) {
    switch (tokenType) {
        case TokenType.typeBool:
            return LiteralType.booleanLiteral;
        case TokenType.typeInt:
            return LiteralType.integerLiteral;
        case TokenType.typeString:
            return LiteralType.stringLiteral;
        case TokenType.typeFloat:
            return LiteralType.floatLiteral;
        case TokenType.null:
            return LiteralType.nullLiteral;
        default:
            return null;
    }
}

export function checkLiteralType(
    provided: LiteralType,
    required: LiteralType[],
    line: LineCount,
) {
    if (!required.includes(provided)) {
        let expected = "";
        required.forEach((literalType, index) => {
            expected += ` '${getEmojiFromLiteralType(literalType)}' ${index === required.length - 1 ? "" : " or"}`;
        });
        error(
            `Expected type${expected}, but got type ${getEmojiFromLiteralType(provided)}`,
            line,
        );
    }
}

export class Parser {
    private program: Program = new Program([]);
    private index: number = 0;
    private readonly tokens: Token[];
    private scopes: {
        vars: Map<string, Expression>;
        functions: Map<string, VarFunction>;
    }[] = [
        {
            vars: new Map<string, Expression>(),
            functions: new Map<string, VarFunction>(),
        },
    ];

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    private getVars(): Map<string, Expression> {
        let result = new Map<string, Expression>();
        for (const map of this.scopes) {
            result = mergeMaps(result, map.vars);
        }
        return result;
    }
    private getFunctions(): Map<string, VarFunction> {
        let result = new Map<string, VarFunction>();
        for (const map of this.scopes) {
            result = mergeMaps(result, map.functions);
        }
        return result;
    }

    /** check the next token
     * @returns {Token | null} the token it's at or null
     * */
    private peek(count: number = 0): Token | null {
        return this.tokens[this.index + count] ?? null;
    }

    /** Check the type of the current token and consume if it matches
     * @param {TokenType} type The required type
     * @param {string} error_ Error to throw if types don't match.
     * If the function should not throw an error, leave the error empty
     * @returns {}
     * */
    private tryConsume(
        type: TokenType,
        error_: { error: string; line: LineCount } = {
            error: "",
            line: { line: 0, file: "" },
        },
    ): Token | null {
        if (this.peek()?.type === type) {
            return this.consume();
        } else if (error_.line.line === 0) {
            return null;
        } else {
            error(error_.error, error_.line);
        }
    }

    /** go to next token
     * @returns {Token} the used token
     * */
    private consume(): Token {
        return this.tokens[this.index++];
    }

    /** Parse the term coming up in tokens
     * @returns {Term | null} the parsed term
     * */
    private parseTerm(): Term | null {
        const token = this.peek();
        if (token?.type === TokenType.int_lit) {
            this.consume();
            return new TermInteger(token.line, token.value);
        } else if (token?.type === TokenType.float) {
            this.consume();
            return new TermFloat(token.line, token.value);
        } else if (token?.type === TokenType.ident) {
            this.consume();
            if (
                this.peek()?.type === TokenType.callFunction &&
                !this.getVars().has(token.value)
            ) {
                this.consume();
                if (!this.getFunctions().has(token.value)) {
                    error("Undeclared function", token.line);
                }
                let arguments_: Expression[] = [];
                if (this.peek()?.type !== TokenType.semi) {
                    while (this.peek()?.type !== TokenType.callFunction) {
                        arguments_.push(this.parseExpr());
                        if (
                            !this.tryConsume(TokenType.comma) &&
                            this.peek()?.type !== TokenType.callFunction
                        ) {
                            error("Expected '🌶️'", this.peek(-1).line);
                        }
                    }

                    this.tryConsume(TokenType.callFunction, {
                        error: "Expected '🔫'",
                        line: token.line,
                    });
                }

                const requiredArguments = this.getFunctions().get(
                    token.value,
                ).arguments;
                if (requiredArguments.length !== arguments_.length) {
                    error(
                        `Function '${token.value}' expected ${requiredArguments.length} arguments, but got ${arguments_.length}`,
                        token.line,
                    );
                }
                for (let i = 0; i < requiredArguments.length; i++) {
                    // if (
                    //     requiredArguments[i].type !== arguments_[i].literalType
                    // ) {
                    //     error(
                    //         `Function argument '${
                    //             requiredArguments[i].identifier
                    //         }' requires type '${getEmojiFromLiteralType(
                    //             requiredArguments[i].type,
                    //         )}' but got type '${getEmojiFromLiteralType(arguments_[i].literalType)}'`,
                    //         token.line,
                    //     );
                    // }
                }
                return new TermFunctionCall(
                    token.value,
                    this.getFunctions().get(token.value).returnType,
                    arguments_,
                    this.peek(-1).line,
                );
            } else if (this.peek()?.type === TokenType.openBracket) {
                this.consume();
                if (!this.getVars().has(token.value)) {
                    error(`Undeclared identifier '${token.value}'`, token.line);
                }
                let array: TermArray = this.getVars().get(
                    token.value,
                ) as TermArray;
                if (array.literalType !== LiteralType.arrayLiteral) {
                    error(
                        `Can't use '[]' on type '${getEmojiFromLiteralType(array.literalType)}'`,
                        token.line,
                    );
                }
                const expr = this.parseExpr();
                if (!expr) {
                    error("Invalid expression", token.line);
                }
                this.tryConsume(TokenType.closeBracket, {
                    error: "Expected '🌛'",
                    line: token.line,
                });
                return new TermArrayAccess(
                    token.value,
                    array.valueType,
                    expr,
                    token.line,
                );
            }
            if (!this.getVars().has(token.value)) {
                error(`Undeclared identifier '${token.value}'`, token.line);
            }
            return new TermIdentifier(
                token.line,
                token.value,
                this.getVars().get(token.value).literalType,
            );
        } else if (token?.type === TokenType.quotes) {
            this.consume();
            const value = this.tryConsume(TokenType.string, {
                error: "Expected string",
                line: token.line,
            });
            this.tryConsume(TokenType.quotes, {
                error: "Expected '🔠'",
                line: token.line,
            });
            return new TermString(token.line, value.value);
        } else if (token?.type === TokenType.boolean_lit) {
            this.consume();
            return new TermBoolean(token.line, token.value);
        } else if (token?.type === TokenType.open_paren) {
            this.consume();
            const expr = this.parseExpr();
            if (!expr) {
                error("Invalid expression", token.line);
            }
            this.tryConsume(TokenType.close_paren, {
                error: "Expected '🧱'",
                line: token.line,
            });
            return new TermParens(expr, token.line);
        } else if (token?.type === TokenType.null) {
            return new TermNull(this.consume().line);
        } else if (token?.type === TokenType.openBracket) {
            const line = this.consume().line;
            let type = getLiteralTypeFromTokenType(this.peek()?.type);
            let values: Term[] = [];
            if (type === null) {
                while (this.peek()?.type !== TokenType.closeBracket) {
                    values.push(this.parseTerm());
                    if (this.peek()?.type !== TokenType.closeBracket) {
                        this.tryConsume(TokenType.comma, {
                            error: "Expected '🌶️' or '🌛'",
                            line: line,
                        });
                    }
                }
                type = values[0].literalType;
            }
            this.tryConsume(TokenType.closeBracket, {
                error: "Expected '🌛'",
                line: line,
            });
            return new TermArray(type, values, line);
        } else if (this.peek()?.type === TokenType.object) {
            const line = this.consume().line;
            let vars: Map<string, StatementLet> = new Map<
                string,
                StatementLet
            >();
            let functions: Map<string, StatementFunctionDefinition> = new Map<
                string,
                StatementFunctionDefinition
            >();
            while (this.peek() && this.peek()?.type !== TokenType.object) {
                const ident = this.tryConsume(TokenType.ident, {
                    error: "Expected identifier",
                    line: line,
                });
                this.tryConsume(TokenType.equals, {
                    error: "Expected '🪢'",
                    line: ident.line,
                });
                if (this.peek()?.type === TokenType.function) {
                    functions.set(
                        ident.value,
                        this.parseStatement() as StatementFunctionDefinition,
                    );
                }
                vars.set(
                    ident.value,
                    new StatementLet(this.parseExpr(), ident, line),
                );
            }
            this.tryConsume(TokenType.object, {
                error: "Expected '🗃️' at end of object",
                line: line,
            });
            return new TermObject(
                LiteralType.objectLiteral,
                vars,
                functions,
                line,
            );
        } else if (this.peek()?.type === TokenType.typeFloat) {
            const line = this.consume().line;
            const expression = this.parseExpr();
            if (!expression) {
                error("Invalid expression", line);
            }
            checkLiteralType(
                expression.literalType,
                [LiteralType.integerLiteral],
                line,
            );
            return new TermParseToFloat(expression, line);
        } else if (this.peek()?.type === TokenType.typeInt) {
            const line = this.consume().line;
            const expression = this.parseExpr();
            if (!expression) {
                error("Invalid expression", line);
            }
            checkLiteralType(
                expression.literalType,
                [LiteralType.floatLiteral],
                line,
            );
            return new TermParseToInt(expression, line);
        } else if (this.peek()?.type === TokenType.typeString) {
            const line = this.consume().line;
            const expression = this.parseExpr();
            if (!expression) {
                error("Invalid expression", line);
            }

            return new TermParseToString(expression, line);
        } else if (this.peek()?.type === TokenType.exclamation) {
            const line = this.consume().line;
            const expression = this.parseExpr();
            if (!expression) {
                error("Invalid expression", line);
            }
            checkLiteralType(
                expression.literalType,
                [LiteralType.booleanLiteral],
                line,
            );
            return new BooleanBinaryExpressionXor(
                expression,
                new TermBoolean(line, "1"),
                line,
            );
        } else if (this.peek().type === TokenType.greater) {
            const line = this.consume().line;
            const term = this.parseTerm();
            if (!term) {
                error("Can't create pointer to invalid term", line);
            }
            return new TermPointer(term, line);
        } else if (this.peek().type === TokenType.smaller) {
            const line = this.consume().line;
            let type = getLiteralTypeFromTokenType(this.peek()?.type);
            if (type) {
                this.consume();
            }
            const term = this.parseTerm();
            if (!term) {
                error("Can't access value at invalid term", line);
            }
            if (term instanceof TermIdentifier) {
                const ident = term as TermIdentifier;
                type = this.getVars().get(ident.identifier).literalType;
            } else if (!type) {
                error(
                    "Memory access at direct addresses has to specify its type",
                    line,
                );
            }

            return new TermMemoryAccess(type, term, line);
        } else {
            return null;
        }
    }

    /**Parse the else if or else statement
     * */
    private parseIfPredicate(): IfPredicate {
        const predicate = this.peek();
        if (predicate?.type === TokenType.elseif) {
            this.consume();
            //get the expression
            const expr = this.parseExpr();
            if (!expr) {
                error("Expected expression", predicate.line);
            }
            this.tryConsume(TokenType.elseif, {
                error: "Expected '📐'",
                line: predicate.line,
            });

            //get the scope
            const scope = this.parseScope();
            if (!scope) {
                error("Invalid scope", predicate.line);
            }
            //get the optional next predicate
            const ifPredicate = this.parseIfPredicate();

            return new ElseIfPredicate(
                expr,
                scope,
                predicate.line,
                ifPredicate,
            );
        } else if (predicate?.type === TokenType.else) {
            this.consume();
            //get the scope
            const scope = this.parseScope();
            if (!scope) {
                error("Invalid scope", predicate.line);
            }
            return new ElsePredicate(scope, predicate.line);
        }
    }

    /** Parse the next token(s) to a statement
     * @returns {Statement | null} the create statement
     * */
    private parseStatement(): Statement | null {
        if (this.peek()?.type === TokenType.exit) {
            const line = this.consume().line;
            let statementExit: StatementExit;

            //get expr inside exit
            const expr = this.parseExpr();
            if (expr) {
                statementExit = new StatementExit(expr, line);
            } else {
                error("Invalid expression", line);
            }
            //missing semi
            this.tryConsume(TokenType.semi, { error: "Missing '🚀'", line });
            return statementExit;
        } else if (this.peek()?.type === TokenType.print) {
            const line = this.consume().line;

            let statementPrint: StatementPrint;

            const expr = this.parseExpr();
            if (expr) {
                statementPrint = new StatementPrint(expr, line);
            } else {
                error("Invalid expression", line);
            }

            this.tryConsume(TokenType.semi, { error: "Missing '🚀'", line });

            return statementPrint;
        }
        //case let statement
        else if (this.peek()?.type === TokenType.let) {
            //let
            const line = this.consume().line;

            const ident = this.consume();
            let statementLet: StatementLet;
            //equals
            this.consume();

            //parse expression
            const expr = this.parseExpr();
            if (expr) {
                statementLet = new StatementLet(expr, ident, line);
            } else {
                error("Invalid expression", line);
            }

            //missing semi
            if (this.peek()?.type === TokenType.semi) {
                this.consume();
            } else {
                error("Expected '🚀'", line);
            }
            if (
                this.getVars().has(ident.value) ||
                this.getFunctions().has(ident.value)
            ) {
                error(`Identifier ${ident.value} already in use`, line);
            }
            this.scopes[this.scopes.length - 1].vars.set(ident.value, expr);
            return statementLet;
        } else if (
            this.peek()?.type === TokenType.ident &&
            this.peek(1)?.type === TokenType.equals
        ) {
            const ident = this.consume();
            //the equals
            this.consume();

            const expr = this.parseExpr();
            if (!expr) {
                error("Expected expression", ident.line);
            }
            this.tryConsume(TokenType.semi, {
                error: "Expected '🚀'",
                line: ident.line,
            });
            if (!this.getVars().has(ident.value)) {
                error(`Variable '${ident.value}' does not exist`, ident.line);
            }
            checkLiteralType(
                expr.literalType,
                [this.getVars().get(ident.value).literalType],
                ident.line,
            );
            return new StatementAssign(expr, ident, ident.line);
        } else if (this.peek()?.type === TokenType.if) {
            const line = this.consume().line;
            //get expr
            const exprIf = this.parseExpr();
            if (!exprIf) {
                error("Invalid expression", line);
            }
            this.tryConsume(TokenType.if, {
                error: "Expected '✂️'",
                line: line,
            });
            //get scope
            const scope = this.parseScope();
            if (!scope) {
                error("Invalid scope", line);
            }
            return new StatementIf(
                exprIf,
                scope,
                line,
                this.parseIfPredicate(),
            );
        } else if (this.peek()?.type === TokenType.function) {
            const line = this.consume().line;
            const type = getLiteralTypeFromTokenType(this.consume()?.type);
            if (!type) {
                error("Expected type declaration", line);
            }
            const identifier = this.tryConsume(TokenType.ident, {
                error: "Expected identifier",
                line: line,
            }).value;
            this.tryConsume(TokenType.function, {
                error: "Expected '🛒'",
                line: line,
            });
            let arguments_: FunctionArgument[] = [];
            while (this.peek()?.type !== TokenType.open_curly) {
                const argType = getLiteralTypeFromTokenType(
                    this.consume()?.type,
                );
                if (!argType) {
                    error("Expected type declaration for argument", line);
                }
                const argIdent = this.tryConsume(TokenType.ident, {
                    error: "Expected identifier",
                    line: line,
                }).value;
                arguments_.push(new FunctionArgument(argType, argIdent));
                if (
                    this.getVars().has(argIdent) ||
                    this.getFunctions().has(argIdent)
                ) {
                    error(`Identifier '${argIdent}' already declared`, line);
                }
                this.scopes[this.scopes.length - 1].vars.set(
                    argIdent,
                    new Term(argType, line),
                );
            }
            if (
                this.getFunctions().has(identifier) ||
                this.getVars().has(identifier)
            ) {
                error(`Identifier '${identifier}' already in use`, line);
            }
            this.scopes[this.scopes.length - 1].functions.set(identifier, {
                returnType: type,
                arguments: arguments_,
            });
            const scope = this.parseScope();

            for (const arg of arguments_) {
                this.scopes[this.scopes.length - 1].vars.delete(arg.identifier);
            }
            return new StatementFunctionDefinition(
                type,
                identifier,
                arguments_,
                line,
                scope,
            );
        } else if (this.peek()?.type === TokenType.return) {
            const line = this.consume().line;
            const expression = this.parseExpr();
            if (!expression) {
                error("Invalid expression for return", line);
            }
            this.tryConsume(TokenType.semi, {
                error: "Expected '🚀'",
                line: line,
            });
            if (this.scopes.length === 1) {
                //TODO
                error("Cannot '🪃' outisde a function", line);
            }
            //get innermost function
            const idents = Array.from(this.getFunctions().keys());
            const function_ = this.getFunctions().get(
                idents[idents.length - 1],
            );
            if (function_.returnType !== expression.literalType) {
                error(
                    `Returend type '${getEmojiFromLiteralType(
                        expression.literalType,
                    )}' does not match function type '${getEmojiFromLiteralType(
                        function_.returnType,
                    )}'`,
                    line,
                );
            }
            return new StatementReturn(expression, line);
        } else if (
            this.peek()?.type === TokenType.ident &&
            this.peek(1)?.type === TokenType.plusEqual
        ) {
            const ident = this.consume();
            const line = this.consume().line;
            const expr = this.parseExpr();
            if (!expr) {
                error("Invalid expression", line);
            }
            if (!this.getVars().has(ident.value)) {
                error("Undeclared identifier", line);
            }
            const var_ = this.getVars().get(ident.value);
            this.tryConsume(TokenType.semi, {
                error: "Expected '🚀'",
                line: line,
            });
            return new StatementAssign(
                new BinaryExpressionAdd(
                    new TermIdentifier(line, ident.value, var_.literalType),
                    expr,
                    line,
                ),
                ident,
                line,
            );
        } else if (
            this.peek()?.type === TokenType.ident &&
            this.peek(1)?.type === TokenType.minusEqual
        ) {
            const ident = this.consume();
            const line = this.consume().line;
            const expr = this.parseExpr();
            if (!expr) {
                error("Invalid expression", line);
            }
            if (!this.getVars().has(ident.value)) {
                error("Undeclared identifier", line);
            }
            const var_ = this.getVars().get(ident.value);
            checkLiteralType(
                var_.literalType,
                [LiteralType.floatLiteral, LiteralType.integerLiteral],
                line,
            );
            checkLiteralType(
                expr.literalType,
                [LiteralType.floatLiteral, LiteralType.integerLiteral],
                line,
            );
            this.tryConsume(TokenType.semi, {
                error: "Expected '🚀'",
                line: line,
            });
            return new StatementAssign(
                new BinaryExpressionSub(
                    new TermIdentifier(line, ident.value, var_.literalType),
                    expr,
                    line,
                ),
                ident,
                line,
            );
        } else if (
            this.peek()?.type === TokenType.ident &&
            this.peek(1)?.type === TokenType.mulEqual
        ) {
            const ident = this.consume();
            const line = this.consume().line;
            const expr = this.parseExpr();
            if (!expr) {
                error("Invalid expression", line);
            }
            if (!this.getVars().has(ident.value)) {
                error("Undeclared identifier", line);
            }
            const var_ = this.getVars().get(ident.value);
            checkLiteralType(
                var_.literalType,
                [LiteralType.floatLiteral, LiteralType.integerLiteral],
                line,
            );
            checkLiteralType(
                expr.literalType,
                [LiteralType.floatLiteral, LiteralType.integerLiteral],
                line,
            );
            this.tryConsume(TokenType.semi, {
                error: "Expected '🚀'",
                line: line,
            });
            return new StatementAssign(
                new BinaryExpressionMul(
                    new TermIdentifier(line, ident.value, var_.literalType),
                    expr,
                    line,
                ),
                ident,
                line,
            );
        } else if (
            this.peek()?.type === TokenType.ident &&
            this.peek(1)?.type === TokenType.divEqual
        ) {
            const ident = this.consume();
            const line = this.consume().line;
            const expr = this.parseExpr();
            if (!expr) {
                error("Invalid expression", line);
            }
            if (!this.getVars().has(ident.value)) {
                error("Undeclared identifier", line);
            }
            const var_ = this.getVars().get(ident.value);
            checkLiteralType(
                var_.literalType,
                [LiteralType.floatLiteral, LiteralType.integerLiteral],
                line,
            );
            checkLiteralType(
                expr.literalType,
                [LiteralType.floatLiteral, LiteralType.integerLiteral],
                line,
            );
            this.tryConsume(TokenType.semi, {
                error: "Expected '🚀'",
                line: line,
            });
            return new StatementAssign(
                new BinaryExpressionDiv(
                    new TermIdentifier(line, ident.value, var_.literalType),
                    expr,
                    line,
                ),
                ident,
                line,
            );
        } else if (
            this.peek()?.type === TokenType.ident &&
            this.peek(1)?.type === TokenType.doublePlus
        ) {
            const ident = this.consume();
            //consume double plus
            const line = this.consume().line;
            const var_ = this.getVars().get(ident.value);
            checkLiteralType(
                var_.literalType,
                [LiteralType.floatLiteral, LiteralType.integerLiteral],
                line,
            );
            this.tryConsume(TokenType.semi, {
                error: "Expected '🚀'",
                line: line,
            });
            return new StatementAssign(
                new BinaryExpressionAdd(
                    new TermIdentifier(line, ident.value, var_.literalType),
                    new TermInteger(line, "1"),
                    line,
                ),
                ident,
                line,
            );
        } else if (
            this.peek()?.type === TokenType.ident &&
            this.peek(1)?.type === TokenType.doubleMinus
        ) {
            const ident = this.consume();
            //consume double plus
            const line = this.consume().line;
            const var_ = this.getVars().get(ident.value);
            checkLiteralType(
                var_.literalType,
                [LiteralType.floatLiteral, LiteralType.integerLiteral],
                line,
            );
            this.tryConsume(TokenType.semi, {
                error: "Expected '🚀'",
                line: line,
            });
            return new StatementAssign(
                new BinaryExpressionSub(
                    new TermIdentifier(line, ident.value, var_.literalType),
                    new TermInteger(line, "1"),
                    line,
                ),
                ident,
                line,
            );
        } else if (this.peek()?.type === TokenType.while) {
            const line = this.consume().line;
            const expression = this.parseExpr();
            if (!expression) {
                error("Invalid expression", line);
            }
            this.tryConsume(TokenType.while, { error: "Expected '🥏'", line });
            const scope = this.parseScope();
            if (!scope) {
                error("Invalid scope", line);
            }
            return new StatementWhile(expression, scope, line);
        } else if (this.peek()?.type === TokenType.for) {
            const line = this.consume().line;
            let statementAssign: StatementAssign | StatementLet;
            if (this.peek()?.type === TokenType.semi) {
                statementAssign = null;
                this.consume();
            } else {
                statementAssign = this.parseStatement() as
                    | StatementAssign
                    | StatementLet;
                if (
                    !(
                        statementAssign instanceof StatementAssign ||
                        statementAssign instanceof StatementLet
                    )
                ) {
                    error(
                        "Expected assignment of variable in first block of for statement",
                        line,
                    );
                }
            }
            let expression: Expression;
            if (this.peek()?.type === TokenType.semi) {
                expression = new TermBoolean(line, "1");
                this.consume();
            } else {
                expression = this.parseExpr();
                this.tryConsume(TokenType.semi, {
                    error: "Expected '🚀'",
                    line: line,
                });
            }
            let statementModify: StatementAssign;
            if (this.peek()?.type === TokenType.semi) {
                statementModify = null;
                this.consume();
            } else {
                statementModify = this.parseStatement() as StatementAssign;
                if (!(statementModify instanceof StatementAssign)) {
                    error(
                        "Expected assignment of variable in last block of for statement",
                        line,
                    );
                }
            }
            this.tryConsume(TokenType.for, {
                error: "Expected '☎️'",
                line: line,
            });
            const scope = this.parseScope();
            if (!scope) {
                error("Invalid scope", line);
            }
            if (statementAssign instanceof StatementLet) {
                this.scopes[this.scopes.length - 1].vars.delete(
                    statementAssign.identifier,
                );
            }
            return new StatementFor(
                statementAssign,
                expression,
                statementModify,
                scope,
                line,
            );
        } else if (this.peek()?.type === TokenType.import) {
            const line = this.consume().line;
            this.tryConsume(TokenType.quotes, {
                error: "Expected type '📜'",
                line: line,
            });
            const string = this.tryConsume(TokenType.string, {
                error: "Expected type '📜'",
                line: line,
            });
            this.tryConsume(TokenType.quotes, {
                error: "Expected type '📜'",
                line: line,
            });
            this.tryConsume(TokenType.semi, {
                error: "Expected '🚀'",
                line: line,
            });
            let ident = "";
            for (
                let i = 0;
                i < string.value.length && string.value[i] !== "/";
                i++
            ) {
                ident = string.value[i] + ident;
            }
            if (string.value === "math") {
                string.value = "stdlib/math.ejo";
            } else if (string.value === "sys") {
                string.value = "stdlib/sys.ejo";
            } else if (string.value === "str") {
                string.value = "stdlib/str.ejo";
            } else {
                string.value += ".ejo";
            }
            let source = fs.readFileSync(string.value).toString();

            source = demoji(source);
            const tokenizer = new Tokenizer(source, string.value);
            const tokens = tokenizer.tokenize();

            const parser = new Parser(tokens);
            const program = parser.parseProgram();

            console.log(program.statements);

            for (const statement of program.statements) {
                this.program.statements.push(statement);
                if (statement instanceof StatementLet) {
                    if (
                        this.getVars().has(statement.identifier) ||
                        this.getFunctions().has(statement.identifier)
                    ) {
                        error(
                            `Trying to import identifier '${statement.identifier}' that is already defined`,
                            line,
                        );
                    }
                    program.statements.push(statement);
                    this.scopes[0].vars.set(
                        statement.identifier,
                        statement.expression,
                    );
                } else if (statement instanceof StatementFunctionDefinition) {
                    if (
                        this.getVars().has(statement.identifier) ||
                        this.getFunctions().has(statement.identifier)
                    ) {
                        error(
                            `Trying to import function '${statement.identifier}' that is already defined`,
                            line,
                        );
                    }
                    program.statements.push(statement);
                    this.scopes[0].functions.set(
                        statement.identifier,
                        statement,
                    );
                }
            }
            return new StatementImport(line);
        } else if (this.peek()?.type === TokenType.assembly) {
            const line = this.consume().line;
            const string = this.parseExpr();
            if (!string) {
                error("Invalid statement", line);
            }
            checkLiteralType(
                string.literalType,
                [LiteralType.stringLiteral],
                line,
            );
            let data = "";
            let bss = "";
            if (this.peek()?.type === TokenType.comma) {
                this.consume();
                const term = this.parseExpr();
                if (!term) {
                    error("Invalid statement", line);
                }
                checkLiteralType(
                    term.literalType,
                    [LiteralType.stringLiteral],
                    line,
                );
                data = (term as TermString).stringValue;
            }
            if (this.peek()?.type === TokenType.comma) {
                this.consume();
                const term = this.parseExpr();
                if (!term) {
                    error("Invalid statement", line);
                }
                checkLiteralType(
                    term.literalType,
                    [LiteralType.stringLiteral],
                    line,
                );
                bss = (term as TermString).stringValue;
            }
            this.tryConsume(TokenType.semi, {
                error: "Expected '🚀'",
                line: line,
            });
            return new StatementAssembly(
                (string as TermString).stringValue,
                data,
                bss,
                line,
            );
        } else if (this.peek()?.type === TokenType.smaller) {
            const line = this.consume().line;
            const address = this.parseExpr();
            if (!address) {
                error("Invalid statement", line);
            }
            checkLiteralType(
                address.literalType,
                [LiteralType.integerLiteral],
                line,
            );
            this.tryConsume(TokenType.equals, {
                error: "Expected '🪢'",
                line: line,
            });
            const expression = this.parseExpr();
            if (!expression) {
                error("Invalid expression", line);
            }
            this.tryConsume(TokenType.semi, {
                error: "Expected '🚀'",
                line: line,
            });
            return new StatementMemoryModification(address, expression, line);
        } else {
            //check for StatementExpression

            const term = this.parseTerm();
            if (term) {
                this.tryConsume(TokenType.semi, {
                    error: "",
                    line: { line: 0, file: "" },
                });
                return new StatementTerm(term.line, term);
            } else {
                return null;
            }
        }
    }

    // noinspection InfiniteRecursionJS
    /** Parse the next token(s) to an expr
     * @param {number} minPrecedence the minimal precedence of this expression
     * @returns {Expression | null} the created expr
     * */
    private parseExpr(minPrecedence: number = 0): Expression {
        let exprLhs: Expression = this.parseTerm();

        while (true) {
            const currentToken = this.peek();
            let precedence: number;

            //check if the precedence of current expr is smaller than minPrecedence
            if (currentToken) {
                precedence = getBinaryPrecedence(currentToken.type);
                if (precedence === null || precedence < minPrecedence) {
                    break;
                }
            } else {
                break;
            }
            //get operator and second expr
            const operator: Token = this.consume();
            const nextMinPrecedence = precedence + 1;
            const exprRhs = this.parseExpr(nextMinPrecedence);
            if (!exprRhs) {
                error("Invalid expression", operator.line);
            }

            let expr: BinaryExpression;
            if (operator.type === TokenType.plus) {
                expr = new BinaryExpressionAdd(exprLhs, exprRhs, operator.line);
            } else if (operator.type === TokenType.minus) {
                expr = new BinaryExpressionSub(exprLhs, exprRhs, operator.line);
            } else if (operator.type === TokenType.star) {
                expr = new BinaryExpressionMul(exprLhs, exprRhs, operator.line);
            } else if (operator.type === TokenType.slash) {
                expr = new BinaryExpressionDiv(exprLhs, exprRhs, operator.line);
            } else if (operator.type === TokenType.double_equals) {
                expr = new BooleanBinaryExpressionCompare(
                    exprLhs,
                    exprRhs,
                    operator.line,
                );
            } else if (operator.type === TokenType.not_equals) {
                expr = new BooleanBinaryExpressionNotCompare(
                    exprLhs,
                    exprRhs,
                    operator.line,
                );
            } else if (operator.type === TokenType.or) {
                expr = new BooleanBinaryExpressionOr(
                    exprLhs,
                    exprRhs,
                    operator.line,
                );
            } else if (operator.type === TokenType.and) {
                expr = new BooleanBinaryExpressionAnd(
                    exprLhs,
                    exprRhs,
                    operator.line,
                );
            } else if (operator.type === TokenType.xor) {
                expr = new BooleanBinaryExpressionXor(
                    exprLhs,
                    exprRhs,
                    operator.line,
                );
            } else if (operator.type === TokenType.smaller) {
                expr = new BooleanBinaryExpressionLessThan(
                    exprLhs,
                    exprRhs,
                    operator.line,
                );
            } else if (operator.type === TokenType.smallerEquals) {
                expr = new BooleanBinaryExpressionLessEquals(
                    exprLhs,
                    exprRhs,
                    operator.line,
                );
            } else if (operator.type === TokenType.greater) {
                expr = new BooleanBinaryExpressionGreaterThan(
                    exprLhs,
                    exprRhs,
                    operator.line,
                );
            } else if (operator.type === TokenType.greaterEquals) {
                expr = new BooleanBinaryExpressionGreaterEquals(
                    exprLhs,
                    exprRhs,
                    operator.line,
                );
            } else {
                console.assert(false);
            }
            exprLhs = expr;
        }
        return exprLhs;
    }

    /**parse the coming scope in from the tokens
     * @returns {Scope} the created scope
     * */
    parseScope(): Scope {
        const line = this.tryConsume(TokenType.open_curly, {
            error: "Expected '⚽'",
            line: this.peek()?.line ?? { line: -1, file: "" },
        }).line;
        let scope: Scope = new Scope([], line);
        this.scopes.push({ vars: new Map(), functions: new Map() });
        let statement = this.parseStatement();
        while (statement) {
            scope.statements.push(statement);
            statement = this.parseStatement();
        }
        this.scopes.pop();
        this.tryConsume(TokenType.close_curly, {
            error: "Expected '🥅'",
            line: this.peek()?.line ?? { line: -1, file: "" },
        });
        return scope;
    }

    /**Parse the tokens to an understandable parse tree
     * @returns {Program | null} the root node of the parse tree
     * */
    parseProgram(): Program | null {
        while (this.peek()) {
            const statement = this.parseStatement();
            if (statement) {
                this.program.statements.push(statement);
            } else {
                error("Invalid statement", statement?.line);
            }
        }
        return this.program;
    }
}
