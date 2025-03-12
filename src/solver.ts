import { Constraint, findAll } from "dancing-links";
import { LetterGrid } from "./letterGrid";
import { TrieNode } from "./trie";
import { filterUniqueWords, findWordsInGrid, Word } from "./wordFinder";

export class Solver {
    private _trie: TrieNode;
    private _letters: LetterGrid;

    constructor(letters: LetterGrid, trie: TrieNode) {
        this._letters = letters;
        this._trie = trie;          
    }

    private convertToConstraint(word: Word): Constraint<Word> {
        const row = new Array(this._letters.width * this._letters.height).fill(0);
        word.path.forEach((index) => row[index] = 1);
        return {
            row: row,
            data: word
        };
    }

    public filterResultsByHints(results: Word[][], hints: number[]): Word[][] {
        return results.filter((result) => {
            return hints.every((hint) => result.some((word) => word.path[0] == hint));
        });        
    };

    public solve(startPositionHints?: number[] | null | undefined): Word[][] {
        const words = findWordsInGrid(this._letters, this._trie);
        const uniqueWords = filterUniqueWords(words);
        if (uniqueWords.length <= 0) { return []; }
        
        const constraints = uniqueWords.map(word => this.convertToConstraint(word));
        const results = findAll(constraints)
            .map(
                (result) => result.map(resultItem => resultItem.data)
            );

        // If any start position hints have been provided, ensure that only solutions starting from those positions are included
        const filteredResults = (startPositionHints?.length ?? 0) > 0 
            ? this.filterResultsByHints(results, startPositionHints!)
            : results;

        // Sort results so that results with less words come first
        filteredResults.sort((a, b) => a.length - b.length);

        return filteredResults;
    }
};
