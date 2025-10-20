export const getMerges = (rows: string[][]) => {
  const getNames = (rows: string[][]) => rows.map((row) => row[0]);

  const names = getNames(rows);

  const getRepeatingNames = (names: string[]) => {
    const counts: { [key: string]: number } = {};

    names.forEach(
      (name) => (counts[name] = counts[name] ? counts[name] + 1 : 1),
    );

    const repeatingNames: string[] = [];
    Object.keys(counts).forEach((name) => {
      counts[name] > 1 && repeatingNames.push(name);
    });

    return repeatingNames;
  };

  const repeatingNames = getRepeatingNames(names);

  const getStartAndEnd = (names: string[], name: string) => {
    const startToEnd: number[] = [];
    let index = names.indexOf(name);
    while (index !== -1) {
      startToEnd.push(index);
      index = names.indexOf(name, index + 1);
    }
    startToEnd.sort((a, b) => a - b);
    return [startToEnd[0], startToEnd[startToEnd.length - 1]];
  };

  const getIndices = (repeatingNames: string[]) => {
    const indices: number[][] = [];
    repeatingNames.forEach((name) => {
      const [start, end] = getStartAndEnd(names, name);
      start != end && indices.push([start, end]);
    });
    return indices;
  };

  const indices = getIndices(repeatingNames);

  const getRanges = (indices: number[][]) => {
    const ranges: {
      s: { c: number; r: number };
      e: { c: number; r: number };
    }[] = [];
    indices.forEach((startAndEndIndex) => {
      const [start, end] = startAndEndIndex;
      ranges.push({ s: { c: 0, r: start }, e: { c: 0, r: end } });
    });
    return ranges;
  };

  const merges = getRanges(indices);
  return merges;
};
