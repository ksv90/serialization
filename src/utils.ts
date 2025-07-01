import { BASE64_CHARS, MAX_NUMBER } from './constants'

export function randomInt(): number {
    return Math.floor(Math.random() * MAX_NUMBER) + 1
}

export function sortNumbers(a: number, b: number) {
    return a - b
}

export function sortAndJoin(input: readonly number[]): string {
    return [...input].sort(sortNumbers).join(',')
}

export function defaultStr(numbers: readonly number[]): string {
    return numbers.join(',') + 10
}

export function toBase64Char(value: number): string {
    return BASE64_CHARS[value]
}

export function fromBase64Char(char: string): number {
    return BASE64_CHARS.indexOf(char)
}

export function bytesToBase64(bytes: readonly number[]): string {
    let result = ''
    for (let i = 0; i < bytes.length; i += 3) {
        const b1 = bytes[i] ?? 0
        const b2 = bytes[i + 1] ?? 0
        const b3 = bytes[i + 2] ?? 0

        const n = (b1 << 16) | (b2 << 8) | b3
        result += toBase64Char((n >> 18) & 63)
        result += toBase64Char((n >> 12) & 63)
        result += toBase64Char((n >> 6) & 63)
        result += toBase64Char(n & 63)
    }
    return result
}

export function base64ToBytes(base64String: string): number[] {
    const bytes = new Array<number>()
    for (let i = 0; i < base64String.length; i += 4) {
        const n =
            (fromBase64Char(base64String[i]) << 18) |
            (fromBase64Char(base64String[i + 1]) << 12) |
            (fromBase64Char(base64String[i + 2]) << 6) |
            fromBase64Char(base64String[i + 3])

        bytes.push((n >> 16) & 255)
        bytes.push((n >> 8) & 255)
        bytes.push(n & 255)
    }
    return bytes
}
