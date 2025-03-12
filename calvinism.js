import hljs from "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/es/highlight.min.js";

const queryString = location.search,
	$code = document.querySelector("#content"),
	$buttons = {
		code: document.querySelector("#copy-code"),
		curl: document.querySelector("#copy-curl"),
	},
	$filename = document.querySelector("#filename"),
	$errorContainer = document.querySelector("#error");

const retrieveCode = async (queryString) => {
		console.log(queryString);
		if (typeof queryString !== "string" || queryString === "") {
			throw "Please provide a URI to use calvinism: https://ari-s.com/calvinism?uri={{your file}}";
		}
		const params = new URLSearchParams(queryString);
		if (params.get("uri") === null) {
			throw "URI is null";
		}
		const uri = params.get("uri"),
			lang = params.get("lang"),
			softWrap = params.get("softwrap"),
			filename = params.get("filename"),
			network = await fetch(uri);

		if (!network.ok) {
			throw "network error :(";
		}

		const code = await network.text();

		return {
			code: code,
			uri: uri,
			lang: lang,
			filename: filename,
			softWrap: softWrap,
		};
	},
	renderCode = async ($code, code, lang) => {
		try {
			let highlightedCode = code;
			if (typeof lang !== "string") {
				highlightedCode = hljs.highlightAuto(code).value;
			} else {
				highlightedCode = hljs.highlight(code, {
					language: lang,
				}).value;
			}
			$code.innerHTML = highlightedCode;
			$code.classList.add("hljs");
		} catch (err) {
			console.error(err);
			$code.innerText = code;
		}
	},
	renderFilename = ($filename, filename) => {
		$filename.innerText = filename;
	},
	renderCopyButtons = ($buttons, code, uri, filename) => {
		$buttons.code.onmousedown = async (e) => {
			try {
				await navigator.clipboard.writeText(code);
			} catch (err) {
				throw "clipboard did not copy :(";
			}
		};
		$buttons.curl.onmousedown = async (e) => {
			try {
				await navigator.clipboard.writeText(
					`curl "${uri}" -o "${filename}"`,
				);
			} catch (err) {
				throw "clipboard did not copy :(";
			}
		};
	},
	errorState = {
		errorTimeout: null,
	},
	makeError = ($errorContainer, errorText) => {
		if (errorState.errorTimeout !== null) {
			stopTimeout(errorState.errorTimeout);
		}
		$errorContainer.classList.add("shown");
		$errorContainer.innerText = errorText;
		errorState.errorTimeout = setTimeout(() => {
			$errorContainer.classList.remove("shown");
		}, 5000);
	};

try {
	let { code, uri, lang, filename, softWrap } =
		await retrieveCode(queryString);
	filename = filename ?? uri.split("/").slice(-1)[0];
	if (filename.trim() === "") filename = "code.txt";
	if (softWrap !== null) $code.classList.add("soft-wrap");
	renderCode($code, code, lang);
	renderCopyButtons($buttons, code, uri, filename);
	renderFilename($filename, filename);
} catch (error) {
	console.error(error);
	makeError($errorContainer, error);
}
