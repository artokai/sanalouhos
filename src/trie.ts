export class TrieNode {
    private _char: string = '';
    private _children: Map<string, TrieNode> = new Map();
    private _isEnd = false;

    constructor(char = '') {
        this._char = char;
        this._isEnd = false;
        this._children = new Map();
    }   

    public get char(): string {
        return this._char;
    }

    public get isEnd(): boolean {
        return this._isEnd;
    }

    public getChild(char: string): TrieNode | undefined {
        return this._children.get(char.toLowerCase());
    }

    public addWord(word: string) {
        let node: TrieNode = this;
        const lowerWord = word.toLowerCase();
        for (const char of lowerWord) {            
            if (!node._children.has(char)) {
                node._children.set(char, new TrieNode(char));
            }
            node = node._children.get(char)!;
        }
        node._isEnd = true;
    }
}