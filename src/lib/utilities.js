import leven from 'leven'

export function hslToHex(h, s, l) {
	l /= 100
	const a = (s * Math.min(l, 1 - l)) / 100
	const f = (n) => {
		const k = (n + h / 30) % 12
		const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
		return Math.round(255 * color)
			.toString(16)
			.padStart(2, '0') // convert to Hex and prefix "0" if needed
	}
	return `#${f(0)}${f(8)}${f(4)}`
}

export function levenSort(a, baseIndex = 0, property = 'term') {
	var levenArr = []
	a.forEach((e, i) => {
		levenArr[i] = { element: e, leven: leven(a[baseIndex][property], e[property]) }
	})

	levenArr.sort((a, b) => {
		if (a.leven < b.leven) {
			return -1
		}
		if (a.leven > b.leven) {
			return 1
		}
		return 0
	})
	a = []
	levenArr.forEach((e, i) => (a[i] = e.element))

	return a
}

export function debounce(func, timeout = 1000) {
	let timer
	return (...args) => {
		clearTimeout(timer)
		timer = setTimeout(() => {
			func.apply(this, args)
		}, timeout)
	}
}

export function truncateString(input, chars) {
	if (input.length > chars) {
		return input.substring(0, chars) + '…'
	}
	return input
}

export function toTitleCase(str) {
	return str.replace(/\w\S*/g, function (txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
	})
}

export function capitalizeFirstLetter(str) {
	return str.charAt(0).toUpperCase() + str.slice(1)
}

export function shuffle(array) {
	let arr = [...array]
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[arr[i], arr[j]] = [arr[j], arr[i]]
	}
	return arr
}

export function stripHTML(str) {
	return str.replace(/<[^>]*>?/gm, '')
}
