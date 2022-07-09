import DirectoryRecord from './model/AbstractDirectoryRecord'
import PrimaryOrSupplementaryVolumeDescriptor from './model/AbstractPrimaryOrSupplementaryVolumeDescriptor'
import fs from 'fs'
import VolumeDescriptor from './model/VolumeDescriptor'
import VolumeDescriptorTypeCode from './enum/VolumeDescriptorTypeCode'
import PrimaryVolumeDescriptor from './model/PrimaryVolumeDescriptor'
import SupplementaryVolumeDescriptor from './model/SupplementaryVolumeDescriptor'
import DirectoryFile from './model/DirectoryFile'
import path from 'path'

export default class IsoFS {
    private pvd: PrimaryOrSupplementaryVolumeDescriptor
    private root: DirectoryRecord
    private name = ''
    private fOpen: fs.promises.FileHandle
    private isoFilePath: string
    private isoSize: number

    constructor(isoFilePath: string) {
        this.isoFilePath = isoFilePath
    }

    public async mountIso(): Promise<void> {
        const stats = await fs.promises.stat(this.isoFilePath)

        if (stats) {
            this.isoSize = stats.size
            this.fOpen = await fs.promises.open(this.isoFilePath, 'r')
            // eslint-disable-next-line no-array-constructor
            const candidateVDs = new Array<PrimaryOrSupplementaryVolumeDescriptor>()
            const systemSectorSize = 16 * 2048
            const sectorSize = 2048
            let vdTerminatorFound = false
            let readBytes = 0
            const toReadBytes = sectorSize
            while (!vdTerminatorFound && this.isoSize - readBytes > sectorSize) {
                const buffer = Buffer.alloc(toReadBytes)
                fs.readSync(this.fOpen.fd, buffer, 0, toReadBytes, systemSectorSize + readBytes)

                const vd = new VolumeDescriptor(buffer)
                switch (vd.type()) {
                    case VolumeDescriptorTypeCode.PrimaryVolumeDescriptor:
                        candidateVDs.push(new PrimaryVolumeDescriptor(buffer))
                        break
                    case VolumeDescriptorTypeCode.SupplementaryVolumeDescriptor:
                        candidateVDs.push(new SupplementaryVolumeDescriptor(buffer))
                        break
                    case VolumeDescriptorTypeCode.VolumeDescriptorSetTerminator:
                        vdTerminatorFound = true
                        break
                }

                readBytes += toReadBytes
            }

            if (candidateVDs.length === 0) {
                throw new Error(`Unable to find a suitable volume descriptor.`)
            }
            candidateVDs.forEach((v) => {
                // Take an SVD over a PVD.
                if (
                    !this.pvd ||
                    this.pvd.type() !== VolumeDescriptorTypeCode.SupplementaryVolumeDescriptor
                ) {
                    this.pvd = v
                }
            })
            this.root = this.pvd.rootDirectoryEntry(this.fOpen)
        }
    }

    public async unmountIso(): Promise<void> {
        await this.fOpen.close()
    }

    public fileFlatTree(p: string): DirectoryFile[] {
        let flatTree: DirectoryFile[] = []
        const file = this.getDirectoryRecord(p)
        if (file) {
            if (file.isDirectory(this.fOpen)) {
                const children = file.getDirectory(this.fOpen).getFileList()
                for (const child of children) {
                    flatTree = flatTree.concat(
                        this.fileFlatTree(path.join(p, child).replace(/\\/g, '/'))
                    )
                }
            } else {
                flatTree.push({
                    type: 'File',
                    name: file.fileName(this.fOpen),
                    size: file.dataLength(),
                    content: () => {
                        return file.getFile(this.fOpen)
                    },
                } as DirectoryFile)
            }
        }

        return flatTree
    }

    public read(p: string): DirectoryFile {
        const dir = this.getDirectoryRecord(p)
        if (!dir) {
            throw new Error('File not found')
        }
        if (dir.isDirectory(this.fOpen)) {
            return {
                type: 'Directory',
                name: dir.fileName(this.fOpen),
                size: dir.dataLength(),
                content: () => {
                    return dir?.getDirectory(this.fOpen).getFileList()
                },
            } as DirectoryFile
        } else {
            return {
                type: 'File',
                name: dir.fileName(this.fOpen),
                size: dir.dataLength(),
                content: () => {
                    return dir.getFile(this.fOpen)
                },
            } as DirectoryFile
        }
    }

    private getDirectoryRecord(path: string): DirectoryRecord | null {
        // Special case.
        if (path === '/') {
            return this.root
        }
        const components = path.split('/').slice(1)
        let dir = this.root
        for (const component of components) {
            if (dir.isDirectory(this.fOpen)) {
                dir = dir.getDirectory(this.fOpen).getRecord(component)
                if (!dir) {
                    return null
                }
            } else {
                return null
            }
        }
        return dir
    }
}
