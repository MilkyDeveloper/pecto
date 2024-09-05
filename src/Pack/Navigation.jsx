import React from 'react'

import Nav from 'react-bootstrap/Nav'

export function Navigation({ baseURL, currentPage }) {
	return (
		<Nav className="mb-3 py-2 navigation" variant="pills" defaultActiveKey={currentPage}>
			{[
				{ link: 'view', text: 'View' },
				{ link: false, text: 'Experiences' },
				{ link: 'blitz', text: 'Blitz' },
				{ link: 'master', text: 'Master' },
				{ link: false, text: 'Utilities' },
				{ link: 'comprehend', text: 'Comprehend' },
				{ link: 'assess', text: 'Assess' },
				{ link: 'extrapolate', text: 'Extrapolate' },
				// {
				// 	link: 'qgen',
				// 	text: 'QGen',
				// 	className: 'shadow-sm rounded border border-primary',
				// },
			].map(({ link, text, className = null }) => (
				<div className={className} key={text}>
					<Nav.Item>
						<Nav.Link
							{...(link ? { href: `/${link}/${baseURL}` } : { disabled: true })}
							eventKey={link}
						>
							{text}
						</Nav.Link>
					</Nav.Item>
				</div>
			))}
		</Nav>
	)
}
