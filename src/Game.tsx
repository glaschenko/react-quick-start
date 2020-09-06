import React from 'react';
import './index.css';

type ClickHandler = (cell: number) => void;

enum SortMode {
    ASCENDING,
    DESCENDING
}

type GameState = {
    history: Array<GameSnapshot | null>;
    xIsNext: boolean;
    stepNumber: number;
    sortMode: SortMode;
}

type GameSnapshot = {
    squares: Array<String | null>;
    lastClick: number;
}

type BoardProps = {
    squares: Array<String | null>;
    onClick: ClickHandler;
    winner: number[] | null;
}

type SquareProps = {
    value: String | null;
    onClick: () => void;
    highlighted: boolean;
}

class Game extends React.Component<any, GameState> {

    constructor(props: Readonly<any>) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                lastClick: 0,
            }],
            xIsNext: true,
            stepNumber: 0,
            sortMode: SortMode.ASCENDING
        }
    }

    render() {
        let history = this.state.history;
        const current = history[this.state.stepNumber]
        const winner : number[] | null = calculateWinner(current!.squares);


        let moves = history.map((gameSnapshot, move) => {
            if (gameSnapshot == null) return;
            let line = Math.floor(gameSnapshot.lastClick / 3) + 1;
            let row = gameSnapshot.lastClick % 3 + 1;

            const desc = move ? "Перейти к ходу #" + move + ", точка (" + line + ", " + row + ")" :
                "К началу игры";
            return (
                <li key={move}>
                    <button className={this.state.stepNumber === move ? "button-x" : "button"}
                            onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        })


        if(this.state.sortMode === SortMode.DESCENDING){
            moves = moves.reverse();
        }

        let status;
        if (winner) {
            status = "Выиграл " + current?.squares[winner[0]];
        } else {
            if(this.state.stepNumber === 9){
                status = "Ничья"
            }
            else{
                status = "Next player: " + (this.state.xIsNext ? "X" : "O");
            }
        }

        const sortButtonText : String = this.state.sortMode === SortMode.ASCENDING ?
            "Сортировка: по возрастанию" : "Сортировка: по убыванию"

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current!.squares}
                        onClick={(i) => this.handleClick(i)}
                        winner={winner}
                    />
                </div>
                <div className="game-info">
                    <div className="status">{status}</div>
                    <button onClick={() => this.handleSortClick()}>{sortButtonText}</button>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }

    private handleSortClick(){
        this.setState({
            sortMode: this.state.sortMode === SortMode.ASCENDING ? SortMode.DESCENDING : SortMode.ASCENDING,
        })
    }

    private jumpTo(move: number) {
        this.setState({
            stepNumber: move,
            xIsNext: (move % 2) === 0,
        })
    }


    private handleClick(i: number) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current!.squares.slice();

        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? "X" : "O";
        this.setState({
            history: history.concat([{
                squares: squares,
                lastClick: i
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext
        });
    }
}

class Board extends React.Component<BoardProps> {

    renderSquaresLine(line: number) {
        let content: JSX.Element[] = [];
        for (let i = 0; i < 3; i++) {
            let cellIndex = line * 3 + i;
            content.push(this.renderSquare(cellIndex))
        }
        return <div className="board-row">
            {content}
        </div>;
    }

    renderSquare(i: number) {
        let winner = this.props.winner;
        return <Square
            value={this.props.squares[i]}
            onClick={() => this.props.onClick(i)}
            highlighted={winner === null ? false : winner.includes(i,0)}
        />;
    }

    render() {
        let content: JSX.Element[] = [];
        for (let i = 0; i < 3; i++) {
            content.push(this.renderSquaresLine(i));
        }
        return (
            <div>
                {content}
            </div>
        );
    }
}


function Square(props: SquareProps) {
    return (
        <button className={props.highlighted ? "square square-highlighted" : "square"}
                onClick={props.onClick}>
            {props.value}
        </button>
    );
}

function calculateWinner(squares: Array<String | null>) : number[] | null {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return lines[i];
        }
    }
    return null;
}

export default Game;
