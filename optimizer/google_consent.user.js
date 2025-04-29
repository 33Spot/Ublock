// ==UserScript==
// @name         Google Cookie Consent Remover
// @namespace    https://gist.github.com/WoLpH/985a6072b35926eb4a3f9d2cdd0a2dad
// @version      0.6
// @description  Remove Google and Youtube's annoying cookie consent questions (especially annoying for Incognito windows)
// @author       Wolph
// @include      /https:\/\/(www|consent)\.(google|youtube)\.*\w+\/.*$/
// @include      https://consent.google.com/*
// @grant        none
// ==/UserScript==

function autoAgree(){
	let clicked = false;
	const xpath = '//button/div[contains(text(),"Reject all")]';
	const agreeBtn = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	console.log('found button?', agreeBtn);
	if(agreeBtn){
		agreeBtn.click();
		clicked = true;
	}

	const form = document.querySelector('form');
	if(form?.action?.match(/consent/)?.length === 1){
		form.querySelector('button')?.click();
		clicked = true;
	}

	return clicked;
}

if(!autoAgree()){
	setTimeout(autoAgree, 1000);
}
