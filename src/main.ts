import { loadAcceptedWords } from "./dataLoader";
import { LetterGrid } from "./letterGrid";
import { Solver } from "./solver";
import { TrieNode } from "./trie";
import { Word } from "./wordFinder";

enum AppState {
    Initializing = "Initializing",
    Initialized = "Initialized",
    ReadyToSolve = "ReadyToSolve",
    Solved = "Solved",
}

enum Action {
    Initialized = "Initialized",
    AllLettersFilled = "AllLettersFilled",
    LettersMissing = "LettersMissing",
}

let appState = AppState.Initializing;

const positionHints = [] as number[];
const letters = new LetterGrid(5, 6);
const trie  = new TrieNode();

let solutions: Word[][] = [];
let currentSolutionIndex = 0;

const dispatch = (action: Action) => {
    switch (action) {
        case Action.Initialized:
            appState = AppState.Initialized;
            const letterInputs = document.querySelectorAll<HTMLInputElement>('.letterInput');
            letterInputs.forEach((input) => {
                input.disabled = false;
            });
            break;
        case Action.AllLettersFilled:
            appState = AppState.ReadyToSolve;
            break;
        case Action.LettersMissing:
            appState = AppState.Initialized;
            break;
        default:
            console.warn("Unknown action: ", action);
    };
};

const getWordColor = (word: string): string => {
    const colors = [
        "#FF3333",
        "#33CC57",
        "#3357FF",
        "#FF33A1",
        "#FF8C33",
        "#33CCC5",
    ];

    // get hash based on first position and use it to determine color
    const hashCode = (str: string): number => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0;
        }
        return hash;
    };

    return colors[Math.abs(hashCode(word)) % colors.length];
};

const clearSvg = () => {
    const svg = document.getElementById('solutionSvg')!;
    while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
    }
};

const drawSolutionSvg = (solution: Word[]) => {
    solution.forEach((word) => {
        drawWordSvg(word);
    });
};

const convertToSvgCoords = (x: number, y: number): [number, number] => {
    return [
        (74 * x) + 32,
        (74 * y) + 32,
    ];
};

const drawWordSvg = (word: Word) => {
    const svg = document.getElementById('solutionSvg')!;
    const wordGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const lineGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const dotGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const color = getWordColor(word.word);
    let prevSvgX = -1;
    let prevSvgY = -1;

    word.path.forEach((letterIndex, idx) => {
        const [x, y] = letters.getCoords(letterIndex);
        const [svgX, svgY] = convertToSvgCoords(x, y);

        if (prevSvgX >= 0 && prevSvgY >= 0) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', `${prevSvgX}`);
            line.setAttribute('y1', `${prevSvgY}`);
            line.setAttribute('x2', `${svgX}`);
            line.setAttribute('y2', `${svgY}`);
            line.setAttribute('stroke', color);
            line.setAttribute('stroke-width', '2');
            lineGroup.appendChild(line);
        }

        const square = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const squareSize = 40;
        square.setAttribute('x', `${svgX - squareSize / 2}`);
        square.setAttribute('y', `${svgY - squareSize / 2}`);
        square.setAttribute('width', `${squareSize}`);
        square.setAttribute('height', `${squareSize}`);
        square.setAttribute('fill', idx == 0 ? color : 'white');
        square.setAttribute('stroke', color);
        square.setAttribute('stroke-width', '2');
        dotGroup.appendChild(square);

        prevSvgX = svgX;
        prevSvgY = svgY;
    });
    wordGroup.appendChild(lineGroup);
    wordGroup.appendChild(dotGroup);
    svg.appendChild(wordGroup);
};

const clearSolutions = () => {
    solutions = [];
    currentSolutionIndex = 0;
    clearSvg();

    document.getElementById('wordList')!.innerHTML = "";

    document.getElementById('solutionTitle')!.innerText = "(Ei ratkaistu)";
    (document.getElementById('prevBtn') as HTMLButtonElement).disabled = true;
    (document.getElementById('nextBtn') as HTMLButtonElement).disabled = true;

    appState = letters.isFilled() ? AppState.ReadyToSolve : AppState.Initialized;
    (document.getElementById('solveBtn') as HTMLButtonElement).disabled = appState != AppState.ReadyToSolve;
};

const showSolutionWords = (solution: Word[]) => {
    const wordList = document.getElementById('wordList')!;
    solution.forEach((word) => {
        const li = document.createElement('li');
        li.innerText = word.word;
        li.style.color = getWordColor(word.word);
        wordList.appendChild(li);
    });
};

const showSolution = (index: number) => {
    currentSolutionIndex = Math.max(0, Math.min(index, solutions.length - 1));
    document.getElementById('wordList')!.innerHTML = "";
    clearSvg();
    if (currentSolutionIndex >= 0 && currentSolutionIndex < solutions.length) {
        document.getElementById('solutionTitle')!.innerText = `Ratkaisu ${currentSolutionIndex + 1} / ${solutions.length}`;
        (document.getElementById('prevBtn') as HTMLButtonElement).disabled = (currentSolutionIndex <= 0);
        (document.getElementById('nextBtn') as HTMLButtonElement).disabled = (currentSolutionIndex >= solutions.length - 1);

        drawSolutionSvg(solutions[currentSolutionIndex]);
        showSolutionWords(solutions[currentSolutionIndex]);
    } else {
        document.getElementById('solutionTitle')!.innerText = "Ei ratkaisua!";
        (document.getElementById('prevBtn') as HTMLButtonElement).disabled = true;
        (document.getElementById('nextBtn') as HTMLButtonElement).disabled = true;
    }
};

const handleLetterInput = (event: KeyboardEvent) => {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    const index = parseInt(input.id.split('_')[1]);
    const key = event.key.toLowerCase();
    const value = key.match(/^[a-zåäö]$/) ? key.toUpperCase() : "";
    if (input.value == value) { return; }

    input.value = value
    letters[index] = value;

    if (value) {
        const nextInput = document.getElementById(`letter_${index + 1}`) as HTMLInputElement;
        if (nextInput) {
            nextInput.focus();
        } else {
            input.blur();
        }
    }

    dispatch(letters.isFilled() ? Action.AllLettersFilled : Action.LettersMissing);
    clearSolutions();
};

const handleLetterDoubleClick = (event: MouseEvent) => {
    event.preventDefault();
    clearSolutions();

    const input = event.target as HTMLInputElement;
    const letterIndex = parseInt(input.id.split('_')[1]);

    const i = positionHints.indexOf(letterIndex);
    if (i >= 0) {
        positionHints.splice(i, 1);
        input.classList.remove('startPosition');
    } else {
        positionHints.push(letterIndex);
        input.classList.add('startPosition');
    }
}

const handleSolveClick =() => {
    if (appState != AppState.ReadyToSolve) { return; }
    clearSolutions();
    (document.getElementById('solveBtn') as HTMLButtonElement).disabled = true;

    const solver = new Solver(letters, trie);
    solutions = solver.solve(positionHints)
    appState = AppState.Solved;
    showSolution(0);
};

const handleNextClick = () => {
    if (appState != AppState.Solved) { return; }
    showSolution(currentSolutionIndex + 1);

};

const handlePrevClick = () => {
    if (appState != AppState.Solved) { return; }
    showSolution(currentSolutionIndex - 1);
};

const initializeLetters = (value: string) => {
    value = value.replace(/\s/g, '');
    for (let i=0; i<value.length; i++) {
        letters[i] = value[i];
        const input = document.getElementById(`letter_${i}`) as HTMLInputElement;
        input.value = value[i];
    }
    appState = AppState.ReadyToSolve;
    (document.getElementById('solveBtn') as HTMLButtonElement).disabled = false;
};

const initialize = async () => {
    // Add change handlers to letterInputs
    const letterInputs = document.querySelectorAll<HTMLInputElement>('.letterInput');
    letterInputs.forEach((input) => {
        input.disabled = true;
        input.addEventListener('keydown', handleLetterInput);
        input.addEventListener('dblclick', handleLetterDoubleClick);
    });

    document.getElementById('solveBtn')!.addEventListener('click', handleSolveClick);
    document.getElementById('nextBtn')!.addEventListener('click', handleNextClick);
    document.getElementById('prevBtn')!.addEventListener('click', handlePrevClick);

    // Load accepted words
    await loadAcceptedWords(trie);
    dispatch(Action.Initialized)

    // Populate default puzzle
    //initializeLetters('LOMAL IAUAL TASUI KMRSE OADLK LPIEÄ');
}

initialize();



