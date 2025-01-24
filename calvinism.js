import hljs from "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/es/highlight.min.js";

const queryString = location.search,
  $code = document.querySelector("#content"),
  $button = document.querySelector("#copy"),
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
      network = await fetch(uri);

    if (!network.ok) {
      throw "network error :(";
    }

    const code = await network.text();

    return { code: code, uri: uri, lang: lang };
  },
  renderCode = async ($code, $button, $filename, uri, code, lang) => {
    try {
      let highlightedCode = code;
      if (typeof lang !== "string") {
        highlightedCode = hljs.highlightAuto(code).value;
      } else {
        highlightedCode = hljs.highlight(code, { language: lang }).value;
      }
      $code.innerHTML = highlightedCode;
    } catch (err) {
      console.error(err);
      // TODO error
      $code.innerText = code;
    }
    // Setup copy button
    $button.onclick = async (e) => {
      try {
        await navigator.clipboard.writeText(code);
      } catch (err) {
        throw "clipboard did not copy :(";
      }
    };
    const filename = uri.split("/").slice(-1)[0];
    $filename.innerText = filename;
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
  const { code, uri, lang } = await retrieveCode(queryString);
  renderCode($code, $button, $filename, uri, code, lang);
} catch (error) {
  makeError($errorContainer, error);
}
