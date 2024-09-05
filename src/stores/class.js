import { create } from 'zustand'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export const useClass = create((set) => ({
	classy: {},
	status: 'loading',
	loadClass: async (teacher, className) => {
		try {
			set({
				classy: await getDoc(doc(db, 'classes', teacher, 'classes', className)).then(
					(doc) => doc.data()
				),
				status: 'success',
			})
		} catch (e) {
			set({ status: e })
		}
	},
}))
