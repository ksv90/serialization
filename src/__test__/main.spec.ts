import { MAX_NUMBER } from '../constants'
import { checkRandomNumbers, createBoundaryArray, createRandomArray } from './helpers'
;(function main() {
    checkRandomNumbers([2, 1, 3, 2, 2, 1, 2])
    checkRandomNumbers([1, 2, 270, 270, 281, 270, 282, 2, 270])

    checkRandomNumbers(createRandomArray(10))
    checkRandomNumbers(createRandomArray(50))
    checkRandomNumbers(createRandomArray(100))
    checkRandomNumbers(createRandomArray(100))
    checkRandomNumbers(createRandomArray(1000))

    checkRandomNumbers(createBoundaryArray(9, 1))
    checkRandomNumbers(createBoundaryArray(90, 10))
    checkRandomNumbers(createBoundaryArray(201, 100))

    checkRandomNumbers(Array.from({ length: 500 }, (_, i) => i + 2))
    checkRandomNumbers(Array.from({ length: 1000 }, (_, i) => i + 1))
    checkRandomNumbers(Array.from({ length: MAX_NUMBER }, (_, i) => i + 1).flatMap((v) => [v, v, v]))

    if (checkRandomNumbers.errors) {
        throw new Error(`Tests failed, ${checkRandomNumbers.errors} errors`)
    }

    const totalRatio = checkRandomNumbers.ratioList.reduce((acc, value) => acc + value, 0)

    process.stdout.write(`average ratio ${(totalRatio / checkRandomNumbers.ratioList.length).toFixed(2)}\n`)
})()
