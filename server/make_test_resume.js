const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('test_resume.pdf'));

// Add some content
doc.fontSize(25).text('John Doe', { align: 'center' });
doc.fontSize(12).text('Software Engineer | john.doe@email.com', { align: 'center' });
doc.moveDown();

doc.fontSize(16).text('Experience');
doc.fontSize(12).text('Frontend Developer at TechCorp (2022 - Present)');
doc.text('- Built user interfaces using React and JavaScript.');
doc.text('- Improved website performance by 20%.');
doc.moveDown();

doc.fontSize(16).text('Skills');
doc.fontSize(12).text('JavaScript, React, HTML, CSS, Node.js');
doc.moveDown();

doc.fontSize(16).text('Education');
doc.fontSize(12).text('B.S. in Computer Science');

doc.end();
console.log('✅ test_resume.pdf has been created in your server folder!');