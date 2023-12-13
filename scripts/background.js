browser.runtime.onMessage.addListener(function (
  request,
  _sender,
  sendResponse
) {
  if (request.action === "skipInformations") {
    var youSkipCount = localStorage.getItem("youSkipCount");
    var youSkipTimeSkipped = localStorage.getItem("youSkipTimeSkipped");
    if (youSkipCount === null) youSkipCount = 0;
    if (youSkipTimeSkipped === null) youSkipTimeSkipped = 0;
    const onMessageResponse = {
      youSkipCount: youSkipCount,
      youSkipTimeSkipped: youSkipTimeSkipped,
    };
    sendResponse(onMessageResponse);
  }

  if (request.action === "newSkip") {
    var youSkipCount = parseInt(localStorage.getItem("youSkipCount"));
    var youSkipTimeSkipped = parseInt(
      localStorage.getItem("youSkipTimeSkipped")
    );

    if (!youSkipCount) youSkipCount = 0;
    if (!youSkipTimeSkipped) youSkipTimeSkipped = 0;
    youSkipCount++;
    youSkipTimeSkipped += parseInt(request.value);
    console.log(request.value)
    console.log("youSkipTimeSkipped: " + youSkipTimeSkipped);
    localStorage.setItem("youSkipCount", youSkipCount);
    localStorage.setItem("youSkipTimeSkipped", youSkipTimeSkipped);
  }
});
