import React, { useState, useEffect } from 'react'

import './Loading.scss'
import loading from '@/assets/loading.png'

function Loading() {
	const [render, setRender] = useState(false)

	// Only render after 500ms to prevent the loading screen from flashing
	// This loading screen is really only seen on 3G networks
	useEffect(() => {
		setTimeout(() => {
			setRender(true)
		}, 500)
	}, [])

	if (render) {
		return (
			<div id="loading">
				<div id="loadingContent">
					<img src={loading} alt="Logo of Pecto" />
					<br />
					<span className="loader"></span>
				</div>
			</div>
		)
	}
}

export default Loading
