import { PDFExtract, PDFExtractOptions } from 'pdf.js-extract'

// This is intended for Quizlet PDFs

const pdfExtract = new PDFExtract()
const options = {}
pdfExtract.extract('test.pdf', options, (err, data) => {
	if (err) return console.log(err)
	console.log(data)
})
