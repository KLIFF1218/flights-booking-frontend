export function formatTransfers(count: number): string {
  if (!Number.isInteger(count) || count < 0) {
    throw new Error("count must be a non-negative integer");
  }

  if (count === 0) {
    return "Без пересадок";
  }

  const mod10 = count % 10;
  const mod100 = count % 100;

  let word: string;

  if (mod100 >= 11 && mod100 <= 14) {
    word = "пересадок";
  } else if (mod10 === 1) {
    word = "пересадка";
  } else if (mod10 >= 2 && mod10 <= 4) {
    word = "пересадки";
  } else {
    word = "пересадок";
  }

  return `${count} ${word}`;
}

