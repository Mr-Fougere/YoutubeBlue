browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "getYouSkipCount") {
    var youSkipCount = localStorage.getItem("youSkipCount");
    if (youSkipCount === null) youSkipCount = 0;
    sendResponse({ youSkipCount: youSkipCount });
  }
  if (request.action === "setYouSkipCount") {
    localStorage.setItem("youSkipCount", request.value);
  }
});
