export function pilotRate(done: number, total: number) { return total > 0 ? Math.round(done / total * 100) : null; }
