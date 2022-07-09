import TFFlags from '../enum/TFFlags'
import IsoHelper from '../helper/IsoHelper'
import SystemUseEntry from './SystemUseEntry'

export default class TFEntry extends SystemUseEntry {
    constructor(data: Buffer) {
        super(data)
    }
    public flags(): number {
        return this._data[4]
    }
    public creation(): Date | null {
        if (this.flags() & TFFlags.CREATION) {
            if (this._longFormDates()) {
                return IsoHelper.getDate(this._data, 5)
            } else {
                return IsoHelper.getShortFormDate(this._data, 5)
            }
        } else {
            return null
        }
    }
    public modify(): Date | null {
        if (this.flags() & TFFlags.MODIFY) {
            const previousDates = this.flags() & TFFlags.CREATION ? 1 : 0
            if (this._longFormDates()) {
                return IsoHelper.getDate(this._data, 5 + previousDates * 17)
            } else {
                return IsoHelper.getShortFormDate(this._data, 5 + previousDates * 7)
            }
        } else {
            return null
        }
    }
    public access(): Date | null {
        if (this.flags() & TFFlags.ACCESS) {
            let previousDates = this.flags() & TFFlags.CREATION ? 1 : 0
            previousDates += this.flags() & TFFlags.MODIFY ? 1 : 0
            if (this._longFormDates()) {
                return IsoHelper.getDate(this._data, 5 + previousDates * 17)
            } else {
                return IsoHelper.getShortFormDate(this._data, 5 + previousDates * 7)
            }
        } else {
            return null
        }
    }
    public backup(): Date | null {
        if (this.flags() & TFFlags.BACKUP) {
            let previousDates = this.flags() & TFFlags.CREATION ? 1 : 0
            previousDates += this.flags() & TFFlags.MODIFY ? 1 : 0
            previousDates += this.flags() & TFFlags.ACCESS ? 1 : 0
            if (this._longFormDates()) {
                return IsoHelper.getDate(this._data, 5 + previousDates * 17)
            } else {
                return IsoHelper.getShortFormDate(this._data, 5 + previousDates * 7)
            }
        } else {
            return null
        }
    }
    public expiration(): Date | null {
        if (this.flags() & TFFlags.EXPIRATION) {
            let previousDates = this.flags() & TFFlags.CREATION ? 1 : 0
            previousDates += this.flags() & TFFlags.MODIFY ? 1 : 0
            previousDates += this.flags() & TFFlags.ACCESS ? 1 : 0
            previousDates += this.flags() & TFFlags.BACKUP ? 1 : 0
            if (this._longFormDates()) {
                return IsoHelper.getDate(this._data, 5 + previousDates * 17)
            } else {
                return IsoHelper.getShortFormDate(this._data, 5 + previousDates * 7)
            }
        } else {
            return null
        }
    }
    public effective(): Date | null {
        if (this.flags() & TFFlags.EFFECTIVE) {
            let previousDates = this.flags() & TFFlags.CREATION ? 1 : 0
            previousDates += this.flags() & TFFlags.MODIFY ? 1 : 0
            previousDates += this.flags() & TFFlags.ACCESS ? 1 : 0
            previousDates += this.flags() & TFFlags.BACKUP ? 1 : 0
            previousDates += this.flags() & TFFlags.EXPIRATION ? 1 : 0
            if (this._longFormDates()) {
                return IsoHelper.getDate(this._data, 5 + previousDates * 17)
            } else {
                return IsoHelper.getShortFormDate(this._data, 5 + previousDates * 7)
            }
        } else {
            return null
        }
    }
    private _longFormDates(): boolean {
        return !!(this.flags() && TFFlags.LONG_FORM)
    }
}
