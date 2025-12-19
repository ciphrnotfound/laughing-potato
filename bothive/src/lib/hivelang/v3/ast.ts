
export type NodeType =
    | 'Program'
    | 'BotDefinition'
    | 'AgentDefinition'
    | 'OnInputHandler'
    | 'Block'
    | 'IfStatement'
    | 'CallExpression'
    | 'Assignment'
    | 'SayStatement'
    | 'DelegateStatement'
    | 'ReturnStatement'
    | 'ParallelBlock'
    | 'OnEventHandler'
    | 'LoopStatement'
    | 'Literal'
    | 'Identifier'
    | 'BinaryExpression'
    | 'VariableAccess'
    | 'MemberExpression' // NEW: lists[0]
    | 'ArrayLiteral'     // NEW: [1, 2]
    | 'ObjectLiteral'    // NEW: {a: 1}
    | 'FString';

export interface BaseNode {
    type: NodeType;
    loc?: { start: number; end: number; line: number };
}

export interface ProgramNode extends BaseNode {
    type: 'Program';
    body: (BotDefinitionNode | StatementNode)[];
}

export interface BotDefinitionNode extends BaseNode {
    type: 'BotDefinition';
    name: string;
    description?: string;
    body: (AgentDefinitionNode | OnInputHandlerNode | OnEventHandlerNode | StatementNode)[];
}

export interface AgentDefinitionNode extends BaseNode {
    type: 'AgentDefinition';
    name: string;
    description?: string;
    body: (OnInputHandlerNode | OnEventHandlerNode)[];
}

export interface OnEventHandlerNode extends BaseNode {
    type: 'OnEventHandler';
    event: string;
    body: BlockNode;
}

export interface OnInputHandlerNode extends BaseNode {
    type: 'OnInputHandler';
    condition?: ExpressionNode;
    body: BlockNode;
}

export interface BlockNode extends BaseNode {
    type: 'Block';
    statements: StatementNode[];
}

export type StatementNode =
    | IfStatementNode
    | CallExpressionNode
    | AssignmentNode
    | SayStatementNode
    | DelegateStatementNode
    | ReturnStatementNode
    | ParallelBlockNode
    | LoopStatementNode;

export interface IfStatementNode extends BaseNode {
    type: 'IfStatement';
    condition: ExpressionNode;
    consequent: BlockNode;
    alternate?: BlockNode | IfStatementNode; // Else or Elif
}

export interface LoopStatementNode extends BaseNode {
    type: 'LoopStatement';
    variable: string;
    iterable: ExpressionNode;
    body: BlockNode;
}

export interface CallExpressionNode extends BaseNode {
    type: 'CallExpression';
    tool: string; // e.g., "http.get"
    arguments: Record<string, ExpressionNode>;
    outputVariable?: string; // "as result"
}

export interface AssignmentNode extends BaseNode {
    type: 'Assignment';
    variable: string;
    value: ExpressionNode;
}

export interface SayStatementNode extends BaseNode {
    type: 'SayStatement';
    message: ExpressionNode;
}

export interface DelegateStatementNode extends BaseNode {
    type: 'DelegateStatement';
    targetAgent: string;
    params: Record<string, ExpressionNode>;
}

export interface ReturnStatementNode extends BaseNode {
    type: 'ReturnStatement';
    value: ExpressionNode;
}

export interface ParallelBlockNode extends BaseNode {
    type: 'ParallelBlock';
    statements: StatementNode[]; // Usually CallExpressions
}

export type ExpressionNode =
    | LiteralNode
    | IdentifierNode
    | BinaryExpressionNode
    | VariableAccessNode
    | MemberExpressionNode
    | ArrayLiteralNode
    | ObjectLiteralNode
    | FStringNode;

export interface ArrayLiteralNode extends BaseNode {
    type: 'ArrayLiteral';
    elements: ExpressionNode[];
}

export interface ObjectLiteralNode extends BaseNode {
    type: 'ObjectLiteral';
    properties: Record<string, ExpressionNode>;
}

export interface MemberExpressionNode extends BaseNode {
    type: 'MemberExpression';
    object: ExpressionNode;
    property: ExpressionNode;
    computed: boolean; // true for array[i], false for obj.prop
}

export interface LiteralNode extends BaseNode {
    type: 'Literal';
    value: string | number | boolean | null;
    raw: string;
}

export interface IdentifierNode extends BaseNode {
    type: 'Identifier';
    name: string;
}

export interface VariableAccessNode extends BaseNode {
    type: 'VariableAccess';
    parts: string[]; // user.profile.name -> ['user', 'profile', 'name']
}

export interface FStringNode extends BaseNode {
    type: 'FString';
    parts: (string | ExpressionNode)[]; // "Hello {name}" -> ["Hello ", Identifier(name)]
}

export interface BinaryExpressionNode extends BaseNode {
    type: 'BinaryExpression';
    operator: string;
    left: ExpressionNode;
    right: ExpressionNode;
}
