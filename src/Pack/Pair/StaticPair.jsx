import React, { useContext } from 'react'
import { usePack } from '@/stores/pack'
import { shallow } from 'zustand/shallow'
import { Markup } from '@/lib/Markup'
import { ThemeContext } from '@/lib/context'

// import './Pair.scss'

/**
 * Rendered by `Cards` if not editing
 *
 * Could easily be a static component, but accesses the `Pack` store to get the card data for uniformity
 *
 * @component
 * @param {number} index - The index of the card in the pack
 */
function StaticPair({ index }) {
	const [cards] = usePack((state) => [state.pack.content[index]], shallow)
	const theme = useContext(ThemeContext)

	// Muy padding
	return (
		<div className="container overflow-hidden text-center">
			<div className="row row-cols-1 row-cols-sm-2">
				<div className="col p-2">
					<div className={`p-4 shadow-sm bg-${theme.color} rounded-3 noBottomMargin`}>
						{cards.term == '' ? (
							<span className="text-muted">Term {index + 1}</span>
						) : (
							<Markup content={cards.term} />
						)}
					</div>
				</div>
				<div className="col p-2">
					<div className={`p-4 shadow-sm bg-${theme.color} rounded-3 noBottomMargin`}>
						{cards.definition == '' ? (
							<span className="text-muted">Definition {index + 1}</span>
						) : (
							<Markup content={cards.definition} />
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default StaticPair
