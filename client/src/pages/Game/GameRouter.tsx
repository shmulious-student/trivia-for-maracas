import React from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { GameStatus } from '@trivia/shared';
import Lobby from './Lobby';
import Question from './Question';
import Result from './Result';

const GameRouter: React.FC = () => {
    const status = useGameStore((state) => state.status);

    switch (status) {
        case GameStatus.Lobby:
            return <Lobby />;
        case GameStatus.Playing:
            return <Question />;
        case GameStatus.Result:
            return <Result />;
        default:
            return <Lobby />;
    }
};

export default GameRouter;
