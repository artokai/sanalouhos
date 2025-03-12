import { LetterGrid } from "./letterGrid";
import { TrieNode } from "./trie";

export type Word = {
    word: string,
    path: number[],
}

const findAllWordsStartingAtPosition = (grrid: LetterGrid, trie: TrieNode, index: number): Word[] => {
    const wordPaths: number[][] = [];
    const initialState = {searchRoot: trie, position: index, path: [] as number[]};
    const searchStack = [initialState];
    while (searchStack.length > 0) {
        const current = searchStack.pop()!;
        const char = grrid[current.position];
        const nextNode = current.searchRoot.getChild(char);
        if (nextNode) {
            if (nextNode.isEnd) {
                wordPaths.push([...current.path, current.position]);
            }

            const [x, y] = grrid.getCoords(current.position);
            const nextPositions: number[] = [];
            if (y > 0) nextPositions.push(grrid.getIndex(x, y - 1));
            if (x < grrid.width - 1 && y > 0) nextPositions.push(grrid.getIndex(x + 1, y - 1));
            if (x < grrid.width -1) nextPositions.push(grrid.getIndex(x + 1, y));
            if (x < grrid.width - 1 && y < grrid.height - 1) nextPositions.push(grrid.getIndex(x + 1, y + 1));
            if (y < grrid.height - 1) nextPositions.push(grrid.getIndex(x, y + 1));
            if (x > 0 && y < grrid.height - 1) nextPositions.push(grrid.getIndex(x - 1, y + 1));
            if (x > 0) nextPositions.push(grrid.getIndex(x - 1, y));
            if (x > 0 && y > 0) nextPositions.push(grrid.getIndex(x - 1, y - 1));

            for (const nextPosition of nextPositions) {
                if (!current.path.includes(nextPosition)) {
                    searchStack.push({
                        searchRoot: nextNode,
                        position: nextPosition,
                        path: [...current.path, current.position]
                    });
                }
            }
        };
    };

    return wordPaths.map((path) => ({
        word: path.map((index) => grrid[index]).join(''),
        path,
    }));
};


export const findWordsInGrid = (grid: LetterGrid, trie: TrieNode, startPositions?: number[] | null | undefined): Word[] => {
    let words: Word[] = [];
    for (let i = 0; i < grid.width * grid.height; i++) {
        if (!startPositions || startPositions.length <= 0 || startPositions.includes(i)) {
            const wordsAtPosition = findAllWordsStartingAtPosition(grid, trie, i);
            words = words.concat(wordsAtPosition);
        }
    }
    return words;
};

export const filterUniqueWords = (words: Word[]): Word[] => {
    const wordPaths: {[key: string]: number[][]} = {};
    for (const current of words) {
        if (!wordPaths[current.word]) {
            wordPaths[current.word] = [current.path];
        } else {
            const sortedPath = [...current.path]
            sortedPath.sort();
            const exists =  wordPaths[current.word].some((existingPath) => {
                const sortedExistingPath = [...existingPath];
                sortedExistingPath.sort();
                return sortedExistingPath.join(',') === sortedPath.join(',');
            });
            if (!exists) {
                wordPaths[current.word].push(current.path);
            }
        }
    }
    
    const uniqueWords: Word[] = [];
    for (const word in wordPaths) {
        for (const path of wordPaths[word]) {
            uniqueWords.push({ word, path });
        }
    }

    return uniqueWords;
}
