import { create } from 'zustand'
import {
	addNewPack as addNewPackCloud,
	deletePack as deletePackCloud,
	getMyPacks as getMyPacksCloud,
	getUser,
} from '@/lib/firebase'
import {
	addNewPack as addNewPackLocal,
	deletePack as deletePackLocal,
	getMyPacks as getMyPacksLocal,
} from '@/lib/localstore'

function userDefined(user) {
	if (user?.displayName === undefined) {
		return false
	}
	return true
}

async function addUsername(user) {
	if (user?.displayName == undefined) {
		return {}
	} else {
		return { username: await getUser(user.uid) }
	}
}

export const useUser = create((set, get) => ({
	user: {},
	setUser: async (newUser) => set({ user: { ...newUser, ...(await addUsername(newUser)) } }),
	// Utility functions
	newPack: async (id, newPack, forceLocal = false) => {
		if (userDefined(get().user) && !forceLocal) {
			await addNewPackCloud(id, newPack, get().user.username)
		} else {
			await addNewPackLocal(id, newPack)
		}
	},
	deletePack: async (id, forceLocal = false) => {
		if (userDefined(get().user) && !forceLocal) {
			await deletePackCloud(id, get().user.username)
		} else {
			await deletePackLocal(id)
		}
	},
	// TODO: Implement forceLocal in this for consistency
	getMyPacks: async () => {
		if (userDefined(get().user)) {
			return await getMyPacksCloud(get().user.username, get().user.uid)
		} else {
			return await getMyPacksLocal()
		}
	},
	getMyOfflinePacks: async () => {
		return await getMyPacksLocal()
	},
	authenticated: () => {
		if (userDefined(get().user)) {
			return true
		} else {
			return false
		}
	},
}))
