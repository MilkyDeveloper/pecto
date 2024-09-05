import { v4 as uuidv4 } from 'uuid'

const BasePack = () => {
	return {
		name: '',
		class: '',
		author: 'me',
		superficialAuthor: 'Me (Locally Saved)',
		date: new Date(Date.now()).toLocaleString().split(',')[0],
		uid: 'me', // Must be defined when imported to Firestore
		uuid: '',
		published: false,
		pictures: [],
		categories: {
			// id (key) on new categories should be something generated with uuidV4
			default: { name: 'Default', colors: ['transparent', 'transparent'] },
		},
		content: [
			{
				term: '',
				definition: '',
				category: 'default',
				uuid: uuidv4(),
			},
		],
	}
}

export { BasePack }
