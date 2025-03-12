import { TrieNode } from "./trie";

export const loadAcceptedWords = async (trie: TrieNode) => {
    const words = await fetchWordList(3, 10);
    for (const word of words) {
        trie.addWord(word);
    }
};

const fetchWordList = async (minLength: number, maxLength: number) => {
    const response = await fetch("nykysuomensanalista2024.csv");
    const body = await response.text();
    const words = body
        .split("\n")
        .slice(1)
        .map((line) => line.split("\t", 2)[0])
        .filter((word) => word.length >= minLength)
        .filter((word) => word.length <= maxLength)
        .map((word) => word.toLowerCase())
        .filter((word) => /^[a-zåäö]+$/i.test(word))

    return words;
};