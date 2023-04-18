// WorkoutContext.js
import {createContext} from 'react';

const WorkoutContext = createContext({
    emphasis: '4x - Phase 1',
    week: 1,
    setEmphasis: () => {
    },
    setWeek: () => {
    },
});

export default WorkoutContext;
