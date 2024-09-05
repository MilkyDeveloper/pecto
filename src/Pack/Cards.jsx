import React, { useEffect, memo, lazy, Suspense, useContext } from 'react'
import { useState } from 'react'
import StaticPair from './Pair/StaticPair'

// Contains a solid 20% of the bundle, so lazy load it
const EditingPair = lazy(() => import('./Pair/EditingPair'))

import CategorySelect from './CategorySelect'
import PictureSelect from './PictureSelect'

import Button from 'react-bootstrap/Button'

import { usePack } from '@/stores/pack'
import { shallow } from 'zustand/shallow'

import { motion } from 'framer-motion'
import { ThemeContext } from '@/lib/context'

function MotionWrapper({ yes, index, style, children }) {
	if (yes) {
		return (
			<motion.div
				key={index}
				className="p-3"
				style={style}
				initial={{ x: -100 }}
				animate={{ x: 0 }}
				exit={{ scale: 0 }}
			>
				{children}
			</motion.div>
		)
	} else {
		return children
	}
}

/**
 * Rendered for each element in `pack.content`
 *
 * Creates either a `StaticPair` or `EditingPair` depending on the `edit` prop
 *
 * If `edit` is false, it includes an edit button that locally overrides the `edit` prop
 *
 * @component
 * @param {number} index - The index of the card in the pack
 * @param {boolean} edit - Whether or not the card is being edited
 */
function Cards({ index, edit }) {
	const [cards, previousCard, categories, packLength, deleteCard, canEdit] = usePack(
		(state) => [
			// Data
			state.pack.content[index],
			state.pack.content[index - 1],
			state.pack.categories,
			state.pack.content.length,
			state.deleteCard,
			// Editing
			state.canEdit,
		],
		shallow
	)

	const theme = useContext(ThemeContext)

	const [editing, setEditing] = useState(edit)

	useEffect(() => {
		setEditing(edit)
	}, [edit])

	function deletePair() {
		// let p = [...pack.content]
		// p.splice(index, 1)
		deleteCard(index)
	}

	if (cards === undefined) {
		// If the card is undefined, this is probably the first card being deleted
		return <></>
	}

	var extra = ''
	var cardCSS = {}
	if (index !== 0 && cards?.picture !== undefined) {
		if (previousCard?.picture !== cards?.picture && cards.picture !== undefined) {
			extra = <img className="w-100" src={cards.picture}></img>
			cardCSS = {
				boxShadow: '-2px 0 0 #D7DDFC',
			}
		} else if (previousCard?.picture === cards?.picture) {
			cardCSS = {
				boxShadow: '-2px 0 0 #DEE2E6',
			}
		}
	} else if (cards?.picture !== undefined) {
		// max-width: 100px;
		// width: 100%;
		// height: auto;
		extra = <img className="w-100" src={cards.picture}></img>
		cardCSS = {
			boxShadow: '-2px 0 0 #DEE2E6',
		}
	}

	return (
		<div
			style={{
				backgroundImage: `linear-gradient(to right, ${
					categories[cards.category]['colors'][0] + (theme.dark && '33')
				},${categories[cards.category]['colors'][1] + (theme.dark && '33')})`,
				...cardCSS,
			}}
			className="p-3"
		>
			<>{extra}</>
			<div className="d-flex justify-content-between align-items-center mt-5">
				<CategorySelect index={index} />

				<div className="d-flex align-items-center">
					{canEdit ? <PictureSelect index={index} /> : <></>}
					<span className="text-muted ms-3 me-4">{index + 1}</span>
				</div>
			</div>

			{canEdit && editing ? (
				<Suspense fallback={<div>Loading...</div>}>
					<EditingPair index={index} />
				</Suspense>
			) : (
				<StaticPair index={index} />
			)}

			{/* Edit/Remove buttons underneath the cards */}
			{canEdit && (
				<div className="d-flex justify-content-between">
					{!edit && (
						<Button
							className="text-muted text-decoration-none"
							variant="link"
							size="sm"
							onClick={() => setEditing(!editing)}
						>
							{editing ? 'Save' : 'Edit'}
						</Button>
					)}
					{/* eslint-disable-next-line prettier/prettier */}
					{packLength > 1 && (
						<Button
							className="text-muted text-decoration-none"
							variant="link"
							size="sm"
							onClick={deletePair}
							tabIndex="-1"
						>
							Remove
						</Button>
					)}
				</div>
			)}
		</div>
	)
}

// Memo is necessary to prevent the re-rendering of all cards when one is edited
export default memo(Cards)
