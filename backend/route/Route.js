const Router = require('express').Router();

const Path = require('path');
const fs = require('fs');
const Puppeteer = require('puppeteer');
const Handlebars = require('handlebars');

const data = {
  number: "DS/03/2020/001",
  issueDate: "31.03.2020",
  sellDate: "31.03.2020",
  seller: {
    name: "Rafał Podkoński Dev Software",
    address: "Wiktorów, ul. Stołeczna 96, 05-083 Zaborów",
    taxId: "118-201-69-86",
  },
  buyer: {
    name: "Sollers Consulting Sp. z o.o.",
    address: "ul. Koszykowa 54, 00-675 Warszawa",
    taxId: "113-246-30-39",
  },
  items: [{
    name: "Usługa Consultingowa",
    quantity: "1",
    unitOfMeasure: "szt.",
    currency: "PLN",
    nettoPrice: 13650.00,
    nettoValue: 13650.00,
    vatTax: "23%",
    vatTaxValue: 3139.50,
    bruttoValue: 16789.50,
  },{
    name: "Inna usługa consultingowa",
    quantity: "1",
    unitOfMeasure: "szt.",
    currency: "PLN",
    nettoPrice: 10445.62,
    nettoValue: 10445.62,
    vatTax: "23%",
    vatTaxValue: 2402.49,
    bruttoValue: 12848.11,
  },],
  summary: {
    nettoValue: 24095.62,
    vatTaxValue: 5541.99,
    bruttoValue: 29637.61,
  },
};

Router.get('/invoice/:invoiceId.pdf', (req, res) => {
  generatePdf(generateHtml(data)).then((pdf) => {
    res.set('Content-Type', 'application/pdf');
    res.send(pdf);
  }).catch((error) => {
    res.status(500);
    res.send(JSON.stringify(error));
  });
});

Router.get('/invoice/:invoiceId.html', (req, res) => {
  const html = generateHtml(data);
  res.send(html);
});

const generateHtml = (values) => {
  Handlebars.registerHelper('toFixed', (value, decimalPlaces) => {
    return parseFloat(value).toFixed(decimalPlaces);
  });

  Handlebars.registerHelper('inc', (value) => {
    return parseInt(value) + 1;
  });

  const templateHtml = fs.readFileSync(Path.join(process.cwd(), 'templates', 'invoice.html'), 'utf8');
  const template = Handlebars.compile(templateHtml);
  return template(values);
};

const generatePdf = async (html) => {
  const handleError = (error) => {};

  const options = {
		width: '1230px',
		headerTemplate: "<p></p>",
		footerTemplate: "<p></p>",
		displayHeaderFooter: false,
		margin: {
			top: "10px",
			bottom: "30px"
		},
    printBackground: true,
  };
  const broswer = await Puppeteer.launch({
    args: ['--no-sandbox'],
    headless: true,
  }).catch(handleError);
  const page = await broswer.newPage().catch(handleError);
  await page.goto(`data:text/html;charset:UTF-8,${html}`, {
    waitUntil: 'networkidle0',
  }).catch(handleError);
  const pdf = await page.pdf(options).catch(handleError);
  await broswer.close().catch(handleError);
  return pdf;
};

module.exports = Router;