import { Compressor } from '../compressor'
import { randomInt, sortAndJoin } from '../utils'

export function createRandomArray(length: number): number[] {
    return Array.from({ length }, randomInt)
}

export function createBoundaryArray(length: number, bound: number) {
    return Array.from({ length }, (_, i) => i + bound)
}

export function checkRandomNumbers(numbers: readonly number[]): void {
    const compressor = new Compressor()
    const original = numbers.join(',')
    const compressed = compressor.serialize(numbers)
    const ratio = compressed.length / original.length
    const deserialized = compressor.deserialize(compressed)
    const passed = sortAndJoin(deserialized) === sortAndJoin(numbers)
    process.stdout.write(`original (${original.length}) ${original}\n`)
    process.stdout.write(`compressed (${compressed.length}) ${compressed}\n`)
    process.stdout.write(`deserialized (${passed}) ${deserialized.join(',')}\n`)
    process.stdout.write(`ratio ${ratio.toFixed(2)}\n`)
    process.stdout.write('///\n\n')

    checkRandomNumbers.ratioList.push(ratio)

    if (!passed) checkRandomNumbers.errors += 1
}

checkRandomNumbers.ratioList = new Array<number>()
checkRandomNumbers.errors = 0
