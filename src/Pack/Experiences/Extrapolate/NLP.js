import nlp from 'compromise'

import { v4 as uuidv4 } from 'uuid'
import { capitalizeFirstLetter } from '@/lib/utilities'

export function createCategory(category, addCategory) {
	// Create a new category if it doesn't exist
	var uuid = 'default'
	if (category.toLowerCase() !== 'default') {
		uuid = uuidv4()
		addCategory(category, ['transparent', 'transparent'], uuid)
	}
	return uuid
}

export function generateCards(text, category, addCategory, setCards) {
	// Create a new category if one doesn't exist
	const uuid = createCategory(category, addCategory)

	// Parse the sentence using Compromise.js
	const doc = nlp(text)

	// We can't call setTerms() directly,
	// because the state is updated after
	// we use the spread operator the second time
	let t = []

	doc.sentences()
		.json()
		.forEach((sentence) => {
			try {
				// Get the verb phrase in json form
				let vp = nlp(sentence.sentence.verb).verbs().json()[0]

				// Exit if there is no verb phrase
				if (vp?.verb?.auxiliary === undefined) return

				// Get the linking verb
				let lv = vp.verb.auxiliary

				// If there is only one verb,
				// confirm it is a linking verb (copula) and remove it
				if (vp.terms.length <= 1) {
					let isLv = vp.terms[0].tags.includes('Copula')
					if (isLv) vp = ''
				} else {
					// Remove the linking verb from the verb phrase
					vp = sentence.sentence.verb.replaceAll(lv, '').trim() + ' '
				}

				// By now, if the verb phrase isn't a string,
				// it probably contains no linking verbs,
				// so we can just use the original verb phrase
				if (typeof vp !== 'string') vp = sentence.sentence.verb + ' '

				// Get the subject in json form
				let np = nlp(sentence.sentence.subject).json()[0]

				// Exit if there are no terms
				if (np?.terms === undefined) return

				// If the subject is a determiner
				// (e.g. this, that, these, those),
				// replace it with a textbox that autocompletes all previous terms
				let isDeterminer = np.terms[0].tags.includes('Determiner')
				if (isDeterminer) {
					np = 'Could not determine'
				} else {
					np = sentence.sentence.subject
				}

				// Minus whitespace and case,
				// if there is already a term with the same name,
				// append the text to it
				let existingTerm = t.findIndex(
					(term) =>
						term.term.toLowerCase().replace(' ', '') ==
						np.toLowerCase().replace(' ', '')
				)

				if (existingTerm !== -1) {
					t[existingTerm].definition +=
						'. ' + capitalizeFirstLetter(vp + sentence.sentence.predicate)
				} else {
					t.push({
						term: capitalizeFirstLetter(np),
						definition: capitalizeFirstLetter(vp + sentence.sentence.predicate),
						category: uuid,
						uuid: uuidv4(),
					})
				}
			} catch {
				return
			}
		})

	// Update the state
	setCards(t)
}
