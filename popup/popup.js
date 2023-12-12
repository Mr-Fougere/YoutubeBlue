browser.runtime
  .sendMessage({ action: "getYouSkipCount" })
  .then(function (response) {
    const youSkipCount = response.youSkipCount;
    document.getElementById("skip-count").textContent = youSkipCount;
  });
