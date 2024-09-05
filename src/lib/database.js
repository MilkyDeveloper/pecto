import {
	addNewPack as addNewPackCloud,
	deletePack as deletePackCloud,
	getMyPacks as getMyPacksCloud,
} from './firebase'
import {
	addNewPack as addNewPackLocal,
	deletePack as deletePackLocal,
	getMyPacks as getMyPacksLocal,
} from './localstore'

const Database = {
	newPack: async function (id, newPack) {
		if (this._authenticated) {
			addNewPackCloud(id, newPack)
		} else {
			addNewPackLocal(id, newPack)
		}
	},
	deletePack: async function (id) {
		if (this._authenticated) {
			deletePackCloud(id)
		} else {
			deletePackLocal(id)
		}
	},
	getMyPacks: async function () {
		if (this._authenticated) {
			return await getMyPacksCloud()
		} else {
			return await getMyPacksLocal()
		}
	},
}

export { Database }
