import { Readable } from 'stream'

export default class DirectoryFile {
    public type: string
    public name: string
    public size: number
    public content: () => Readable | string[]
}
