export const generateDummyData = (points: number, min: number, max: number): number[] => {
    return Array.from({ length: points }, () => min + Math.random() * (max - min));
};

export const getDummyValue = (min: number, max: number): number => {
    return min + Math.random() * (max - min);
};
