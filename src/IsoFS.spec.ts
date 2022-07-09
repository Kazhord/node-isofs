import IsoFS from './IsoFS'

describe('IsoFS', () => {
    it('should be ok with rock ridge iso directory', async () => {
        let isoFS: IsoFS | undefined
        try {
            isoFS = new IsoFS('fixtures/test_rock_ridge.iso')
            await isoFS.mountIso()
            const dir = isoFS.read('/')
            expect(dir.size).toBe(2048)
        } finally {
            if (isoFS) {
                await isoFS.unmountIso()
            }
        }
    })

    it('should be ok with rock ridge iso file', async () => {
        let isoFS: IsoFS | undefined
        try {
            isoFS = new IsoFS('fixtures/test_rock_ridge.iso')
            await isoFS.mountIso()
            const file = isoFS.read('/README.md')
            expect(file.size).toBe(9494)
        } finally {
            if (isoFS) {
                await isoFS.unmountIso()
            }
        }
    })

    it('should be ok with joliet iso directory', async () => {
        let isoFS: IsoFS | undefined
        try {
            isoFS = new IsoFS('fixtures/test_joliet.iso')
            await isoFS.mountIso()
            const dir = isoFS.read('/')
            expect(dir.size).toBe(2048)
        } finally {
            if (isoFS) {
                await isoFS.unmountIso()
            }
        }
    })

    it('should be ok with joliet iso file', async () => {
        let isoFS: IsoFS | undefined
        try {
            isoFS = new IsoFS('fixtures/test_joliet.iso')
            await isoFS.mountIso()
            const dir = isoFS.read('/README.md')
            expect(dir.size).toBe(9494)
        } finally {
            if (isoFS) {
                await isoFS.unmountIso()
            }
        }
    })
})
