const arr = [0, 8, 8, 6, 5, 5, 5, 8, 5, 6, 5, 1, 5, 7];

function findSums(target, numElems) {
    let best = null;
    function search(index, currentCount, currentSum, subset) {
        if (best) return;
        if (currentCount === numElems) {
            if (currentSum === target) {
                best = [...subset];
            }
            return;
        }
        if (index === arr.length) return;
        if (currentSum > target) return;
        
        subset.push(arr[index]);
        search(index+1, currentCount+1, currentSum + arr[index], subset);
        subset.pop();
        
        search(index+1, currentCount, currentSum, subset);
    }
    search(0, 0, 0, []);
    return best;
}

console.log("Subset 7 summing to 40:", findSums(40, 7));
console.log("Subset 7 summing to 38:", findSums(38, 7));
