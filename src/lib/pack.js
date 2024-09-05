import { db } from './firebase'
import { getDocs, collection, query, where } from 'firebase/firestore'

async function getMyPacks(user) {
	let packs = []
	const userPacks = await getDocs(collection(db, 'packs', user, 'packs'))
	userPacks.forEach((doc) => {
		packs.push(doc.data())
	})

	return packs
}

async function getUsersPacks(user) {
	let packs = []
	const userPacks = await getDocs(
		query(collection(db, 'packs', user, 'packs'), where('published', '==', true))
	)
	userPacks.forEach((doc) => {
		packs.push(doc.data())
	})

	return packs
}

async function getPacks(user) {
	let packs = []
	const userPacks = await getDocs(
		query(collection(db, 'packs', user, 'packs'), where('published', '==', true))
	)
	userPacks.forEach((doc) => {
		packs.push(doc.data())
	})

	return packs
}

export { getMyPacks, getUsersPacks, getPacks }
