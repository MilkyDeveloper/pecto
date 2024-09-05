import React from 'react'
import { useParams } from 'react-router-dom'

export function SearchPacks() {
	const { searchTerm } = useParams()

	return <div>{searchTerm}</div>
}
