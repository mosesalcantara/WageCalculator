export const getMerges = (rows: string[][]) => {
  const getNames = (rows: string[][]) => rows.map((row) => row[0]);

  const names = getNames(rows);

  const getNamesWithMultipleOccurences = (names: string[]) => {
    const counts: { [key: string]: number } = {};

    names.forEach(
      (name) => (counts[name] = counts[name] ? counts[name] + 1 : 1),
    );

    const namesWithMultipleOccurences: string[] = [];
    Object.keys(counts).forEach((name) => {
      counts[name] > 1 && namesWithMultipleOccurences.push(name);
    });

    return namesWithMultipleOccurences;
  };

  const namesWithMultipleOccurences = getNamesWithMultipleOccurences(names);

  const getStartAndEndIndex = (names: string[], name: string) => {
    const indices: number[] = [];
    let index = names.indexOf(name);
    while (index !== -1) {
      indices.push(index);
      index = names.indexOf(name, index + 1);
    }
    indices.sort((a, b) => a - b);
    return [indices[0], indices.at(-1)!];
  };

  const getIndices = (namesWithMultipleOccurences: string[]) => {
    const indices: number[][] = [];
    namesWithMultipleOccurences.forEach((name) => {
      const startAndEndIndex = getStartAndEndIndex(names, name);
      startAndEndIndex && indices.push(startAndEndIndex);
    });
    return indices;
  };

  const indices = getIndices(namesWithMultipleOccurences);

  const getArrayOfMerges = (indices: number[][]) => {
    const merges: {
      s: { c: number; r: number };
      e: { c: number; r: number };
    }[] = [];
    indices.forEach((startAndEndIndex) => {
      const [start, end] = startAndEndIndex;
      merges.push({ s: { c: 0, r: start }, e: { c: 0, r: end } });
    });
    return merges;
  };

  const merges = getArrayOfMerges(indices);
  return merges;
};
