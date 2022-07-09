import SystemUseEntry from '../model/SystemUseEntry'
import fs from 'fs'
import SystemUseEntrySignatures from '../enum/SystemUseEntrySignatures'
import SPEntry from '../model/SPEntry'
import PDEntry from '../model/PDEntry'
import CEEntry from '../model/CEEntry'
import STEntry from '../model/STEntry'
import EREntry from '../model/EREntry'
import ESEntry from '../model/ESEntry'
import PXEntry from '../model/PXEntry'
import PNEntry from '../model/PNEntry'
import SLEntry from '../model/SLEntry'
import NMEntry from '../model/NMEntry'
import CLEntry from '../model/CLEntry'
import PLEntry from '../model/PLEntry'
import REEntry from '../model/REEntry'
import TFEntry from '../model/TFEntry'
import SFEntry from '../model/SFEntry'
import RREntry from '../model/RREntry'

export default class IsoHelper {
    public static rockRidgeIdentifier = 'IEEE_P1282'

    public static getASCIIString(data: Buffer, startIndex: number, length: number): string {
        return data.toString('ascii', startIndex, startIndex + length).trim()
    }

    public static getJolietString(data: Buffer, startIndex: number, length: number): string {
        if (length === 1) {
            // Special: Root, parent, current directory are still a single byte.
            return String.fromCharCode(data[startIndex])
        }
        // UTF16-BE, which isn't natively supported by NodeJS Buffers.
        // Length should be even, but pessimistically floor just in case.
        const pairs = Math.floor(length / 2)
        const chars = new Array(pairs)
        for (let i = 0; i < pairs; i++) {
            const pos = startIndex + (i << 1)
            chars[i] = String.fromCharCode(data[pos + 1] | (data[pos] << 8))
        }
        return chars.join('')
    }

    public static getDate(data: Buffer, startIndex: number): Date {
        const year = parseInt(IsoHelper.getASCIIString(data, startIndex, 4), 10)
        const mon = parseInt(IsoHelper.getASCIIString(data, startIndex + 4, 2), 10)
        const day = parseInt(IsoHelper.getASCIIString(data, startIndex + 6, 2), 10)
        const hour = parseInt(IsoHelper.getASCIIString(data, startIndex + 8, 2), 10)
        const min = parseInt(IsoHelper.getASCIIString(data, startIndex + 10, 2), 10)
        const sec = parseInt(IsoHelper.getASCIIString(data, startIndex + 12, 2), 10)
        const hundrethsSec = parseInt(IsoHelper.getASCIIString(data, startIndex + 14, 2), 10)
        // Last is a time-zone offset, but JavaScript dates don't support time zones well.
        return new Date(year, mon, day, hour, min, sec, hundrethsSec * 100)
    }

    public static getShortFormDate(data: Buffer, startIndex: number): Date {
        const yearsSince1900 = data[startIndex]
        const month = data[startIndex + 1]
        const day = data[startIndex + 2]
        const hour = data[startIndex + 3]
        const minute = data[startIndex + 4]
        const second = data[startIndex + 5]
        // JavaScript's Date support isn't so great; ignore timezone.
        // const offsetFromGMT = this._data[24];
        return new Date(yearsSince1900, month - 1, day, hour, minute, second)
    }

    public static constructSystemUseEntry(
        bigData: fs.promises.FileHandle | Buffer,
        i: number
    ): SystemUseEntry {
        let data: Buffer
        if (bigData instanceof Buffer) {
            data = bigData.slice(i)
        } else {
            // TODO
            data = Buffer.from([])
            fs.readSync(bigData.fd, data, 0, i + 64738, i)
        }
        const sue = new SystemUseEntry(data)
        switch (sue.signatureWord()) {
            case SystemUseEntrySignatures.CE:
                return new CEEntry(data)
            case SystemUseEntrySignatures.PD:
                return new PDEntry(data)
            case SystemUseEntrySignatures.SP:
                return new SPEntry(data)
            case SystemUseEntrySignatures.ST:
                return new STEntry(data)
            case SystemUseEntrySignatures.ER:
                return new EREntry(data)
            case SystemUseEntrySignatures.ES:
                return new ESEntry(data)
            case SystemUseEntrySignatures.PX:
                return new PXEntry(data)
            case SystemUseEntrySignatures.PN:
                return new PNEntry(data)
            case SystemUseEntrySignatures.SL:
                return new SLEntry(data)
            case SystemUseEntrySignatures.NM:
                return new NMEntry(data)
            case SystemUseEntrySignatures.CL:
                return new CLEntry(data)
            case SystemUseEntrySignatures.PL:
                return new PLEntry(data)
            case SystemUseEntrySignatures.RE:
                return new REEntry(data)
            case SystemUseEntrySignatures.TF:
                return new TFEntry(data)
            case SystemUseEntrySignatures.SF:
                return new SFEntry(data)
            case SystemUseEntrySignatures.RR:
                return new RREntry(data)
            default:
                return sue
        }
    }

    public static constructSystemUseEntries(
        data: fs.promises.FileHandle | Buffer,
        i: number,
        len: number,
        isoData: fs.promises.FileHandle
    ): SystemUseEntry[] {
        // If the remaining allocated space following the last recorded System Use Entry in a System
        // Use field or Continuation Area is less than four bytes long, it cannot contain a System
        // Use Entry and shall be ignored
        len = len - 4
        // eslint-disable-next-line no-array-constructor
        let entries = new Array<SystemUseEntry>()
        while (i < len) {
            const entry = IsoHelper.constructSystemUseEntry(data, i)
            const length = entry.length()
            if (length === 0) {
                // Invalid SU section; prevent infinite loop.
                return entries
            }
            i += length
            if (entry instanceof STEntry) {
                // ST indicates the end of entries.
                break
            }
            if (entry instanceof CEEntry) {
                entries = entries.concat(entry.getEntries(isoData))
            } else {
                entries.push(entry)
            }
        }
        return entries
    }
}

export type TGetString = (d: Buffer, i: number, len: number) => string
