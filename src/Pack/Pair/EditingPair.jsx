import React, { useContext, useEffect } from 'react'

import { usePack } from '@/stores/pack'
import { shallow } from 'zustand/shallow'
import { v4 as uuidv4 } from 'uuid'

import { Editor } from './Editor'
import { ThemeContext } from '@/lib/context'

/**
 * Rendered by `Cards` when editing
 *
 * Directly edits the `Pack` store
 *
 * @component
 * @param {number} index - The index of the card in the pack
 */
function EditingPair({ index }) {
	const [cards, packLength, setCard, addCards, setEditing] = usePack(
		(state) => [
			// Data
			state.pack.content[index],
			state.pack.content.length,
			state.setCard,
			state.addCards,
			state.setEditing,
		],
		shallow
	)
	const theme = useContext(ThemeContext)

	useEffect(() => {
		setEditing(true)
		return () => setEditing(false)
	})

	function createNewCard(e) {
		// Tab
		//e.preventDefault()
		// Add a new card
		addCards({
			term: '',
			definition: '',
			category: 'default',
			uuid: uuidv4(),
		}, true)
	}

	return (
		<div className="container overflow-hidden">
			<div className="row">
				<div className="col p-2">
					<div className={`p-2 py-2 shadow-sm bg-${theme.color} rounded-3`}>
						<Editor
							content={cards.term}
							save={(val) => setCard(index, { term: val })}
						/>
					</div>
				</div>
				<div className="col p-2">
					<div className={`p-2 py-2 shadow-sm bg-${theme.color} rounded-3`}>
						<Editor
							content={cards.definition}
							save={(val) => setCard(index, { definition: val })}
							{...(index === packLength - 1 && { tabAction: createNewCard })}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}

export default EditingPair
