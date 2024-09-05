import React from 'react'
import { Filter, Interweave } from 'interweave'
import './Markup.scss'

// https://interweave.dev/docs/filters
class LinkFilter extends Filter {
	node(name, node) {
		if (name === 'a') {
			node.setAttribute('target', '_blank')
		}

		return node
	}
}

export function Markup({ content }) {
	return <Interweave filters={[new LinkFilter()]} content={content} />
}
