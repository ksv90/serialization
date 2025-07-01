import { BITMASK_METHOD, DIFFERENTIAL_METHOD, INCREMENTAL_METHOD } from './constants'
import { base64ToBytes, bytesToBase64, defaultStr, sortNumbers } from './utils'

export class Compressor {
    serialize(numbers: readonly number[]): string {
        const plan = numbers.join(',')
        const sorted = [...numbers].sort(sortNumbers)
        const bitmask = this.#bitmaskSerialize(numbers)
        const differential = this.#differentialSerialize(sorted)
        const incremental = this.#incrementalSerialize(sorted)

        const candidates = [
            plan,
            `${BITMASK_METHOD}:${bitmask}`,
            `${DIFFERENTIAL_METHOD}:${differential}`,
            `${INCREMENTAL_METHOD}:${incremental}`,
        ]

        return candidates.reduce((min, curr) => (curr.length < min.length ? curr : min))
    }

    deserialize(serialized: string): number[] {
        const [method, encoded = method] = serialized.split(':')

        if (method === encoded) {
            return encoded.split(',').map(Number)
        }

        switch (method) {
            case BITMASK_METHOD:
                return this.#bitmaskDeserialize(encoded)
            case DIFFERENTIAL_METHOD:
                return this.#differentialDeserialize(encoded)
            case INCREMENTAL_METHOD:
                return this.#incrementalDeserialize(encoded)
            default:
                throw new Error(`Unknown method: ${method}`)
        }
    }

    #bitmaskSerialize(numbers: readonly number[]): string {
        const freq = new Map<number, number>()
        const bytes = new Array<number>()
        for (const n of numbers) {
            freq.set(n, (freq.get(n) || 0) + 1)
        }

        for (const [num, count] of freq.entries()) {
            bytes.push((num >> 8) & 255)
            bytes.push(num & 255)
            bytes.push(count)
        }

        return bytesToBase64(bytes)
    }

    #bitmaskDeserialize(base64: string): number[] {
        const bytes = base64ToBytes(base64)
        const result = new Array<number>()

        for (let i = 0; i < bytes.length; i += 3) {
            const num = (bytes[i] << 8) | bytes[i + 1]
            const count = bytes[i + 2]
            for (let j = 0; j < count; j += 1) {
                result.push(num)
            }
        }

        return result
    }

    #differentialSerialize(numbers: readonly number[]): string {
        if (numbers.length === 0) return defaultStr(numbers)

        const bytes = new Array<number>()

        bytes.push(numbers.length & 255)
        bytes.push((numbers.length >> 8) & 255)

        let prev = numbers[0]
        bytes.push((prev >> 8) & 255)
        bytes.push(prev & 255)

        for (let i = 1; i < numbers.length; i++) {
            const delta = numbers[i] - prev
            if (delta >= 0 && delta <= 255) {
                bytes.push(0)
                bytes.push(delta)
            } else {
                bytes.push(1)
                bytes.push((delta >> 8) & 255)
                bytes.push(delta & 255)
            }
            prev = numbers[i]
        }

        return bytesToBase64(bytes)
    }

    #differentialDeserialize(base64: string): number[] {
        const bytes = base64ToBytes(base64)

        if (bytes.length < 4) return []

        let i = 0
        const len = bytes[i++] | (bytes[i++] << 8)
        const first = (bytes[i++] << 8) | bytes[i++]
        const result = [first]
        let prev = first

        while (result.length < len && i < bytes.length) {
            const flag = bytes[i++]
            const delta = flag === 0 ? bytes[i++] : (bytes[i++] << 8) | bytes[i++]
            prev += delta
            result.push(prev)
        }

        return result
    }

    #incrementalSerialize(numbers: readonly number[]): string | null {
        if (numbers.length < 3) return defaultStr(numbers)

        const step = numbers[1] - numbers[0]

        if (step === 0 || step < -32768 || step > 32767) return defaultStr(numbers)

        for (let i = 2; i < numbers.length; i++) {
            if (numbers[i] !== numbers[i - 1] + step) {
                return defaultStr(numbers)
            }
        }

        const start = numbers[0]
        const count = numbers.length

        const bytes: number[] = [
            (start >> 8) & 255,
            start & 255,
            (step >> 8) & 255,
            step & 255,
            (count >> 8) & 255,
            count & 255,
        ]

        return bytesToBase64(bytes)
    }

    #incrementalDeserialize(base64: string): number[] {
        const bytes = base64ToBytes(base64)

        if (bytes.length < 6) return []

        const start = (bytes[0] << 8) | bytes[1]
        let step = (bytes[2] << 8) | bytes[3]
        const count = (bytes[4] << 8) | bytes[5]

        if (step & 0x8000) step -= 0x10000

        return Array.from({ length: count }, (_, i) => start + step * i)
    }
}
