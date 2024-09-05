import React, { useEffect } from 'react'

import { useParams } from 'react-router-dom'

import { usePack } from '@/stores/pack'
import { shallow } from 'zustand/shallow'

import Spinner from 'react-bootstrap/Spinner'
import { Navigation } from '../Navigation'
import { Filter } from './Filter'

export function Experience({ children, name, showFilter = true }) {
	const { displayName, packId } = useParams()

	// No need to be specfic with selectors here,
	// since we aren't editing the pack
	const [pack, error, loading, loadPack] = usePack(
		(state) => [state.defaultPack, state.error, state.loading, state.loadPack],
		shallow
	)

	// Load the pack
	useEffect(() => {
		loadPack(displayName, packId)
	}, [])

	// The === is very important, since it must be a boolean, not an error object
	if (error === true) {
		return (
			<div className="text-center">
				<h1>404</h1>
				<p>Sorry, this pack doesn&apos;t exist.</p>
			</div>
		)
	}

	// The error has an error code (e.g. 403, network errors, etc.)
	if (error) {
		return (
			<div className="text-center">
				<h1>403</h1>
				<p>This pack exists, but hasn&apos;t been published.</p>
				<code>{error.toString()}</code>
			</div>
		)
	}

	// Wait for the pack to load
	if (loading) {
		return (
			<div className="text-center">
				<h1>📎</h1>
				<Spinner animation="grow" size="sm" />
			</div>
		)
	}

	// If the filtered content is empty
	if (pack.content.length === 0) {
		return (
			<div className="container">
				<Filter />

				<div className="text-center">
					<h1>📎</h1>
					<p>This category or pack contains no cards</p>
				</div>
			</div>
		)
	}

	return (
		<div className="container">
			<Navigation baseURL={`${pack.author}/${pack.uuid}`} currentPage={name} />

			{showFilter && <Filter />}

			{children}
		</div>
	)
}
