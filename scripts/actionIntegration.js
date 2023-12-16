const createResolutionBlurCheckbox = (checked) => {
  const resolutionBlurCheckbox = document.createElement("div");
  resolutionBlurCheckbox.className = "ytp-menuitem";
  resolutionBlurCheckbox.setAttribute("role", "menuitemcheckbox");
  resolutionBlurCheckbox.setAttribute("aria-checked", checked);
  resolutionBlurCheckbox.setAttribute("tabindex", "0");
  resolutionBlurCheckbox.setAttribute("id", "resolution-blur");

  const iconDiv = document.createElement("div");
  iconDiv.className = "ytp-menuitem-icon";

  const labelDiv = document.createElement("div");
  labelDiv.className = "ytp-menuitem-label";
  labelDiv.innerText = "Resolution Blur";

  const contentDiv = document.createElement("div");
  contentDiv.className = "ytp-menuitem-content";

  const toggleCheckboxDiv = document.createElement("div");
  toggleCheckboxDiv.className = "ytp-menuitem-toggle-checkbox";

  resolutionBlurCheckbox.appendChild(iconDiv);
  resolutionBlurCheckbox.appendChild(labelDiv);
  contentDiv.appendChild(toggleCheckboxDiv);
  resolutionBlurCheckbox.appendChild(contentDiv);

  return resolutionBlurCheckbox;
};

const displayTooltipText = (button) => {
  const title = button.getAttribute("title");
  button.removeAttribute("title");

  const tooltipText = document.querySelector(".ytp-tooltip-text");

  tooltipText.innerText = title;
};

const createAdSkipper = (enabled) => {
  const adSkipperButton = document.createElement("button");
  adSkipperButton.className = "ytp-ads-button ytp-button";
  adSkipperButton.setAttribute("aria-keyshortcuts", "a");
  adSkipperButton.setAttribute("data-priority", "11");
  adSkipperButton.setAttribute("data-tooltip-target-id", "ytp-ads-button");
  adSkipperButton.setAttribute("data-title-no-tooltip", "Ads Skipper");
  adSkipperButton.setAttribute("aria-enabled", enabled);
  adSkipperButton.setAttribute("aria-label", "Ads Skipper Keyshortcut a");
  adSkipperButton.setAttribute("title", "Ads Skipper (a)");

  const svgElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  svgElement.setAttribute("width", "100%");
  svgElement.setAttribute("height", "100%");
  svgElement.setAttribute("version", "1.1");
  svgElement.setAttribute("viewBox", "0 0 1350.000000 1350.000000");
  svgElement.innerHTML = `<g transform="translate(0.000000,1350.000000) scale(0.100000,-0.100000)"
  fill="#000000" stroke="none">
  <path d="M9106 9373 c-126 -249 -176 -340 -195 -351 -14 -8 -552 -240 -1196
  -516 l-1170 -501 0 -1370 0 -1370 1170 -501 c644 -276 1182 -508 1196 -516 19
  -11 69 -102 195 -351 l169 -337 343 0 342 0 0 1243 0 1243 33 19 c54 32 148
  126 192 195 65 99 95 181 108 288 20 172 -16 328 -107 465 -40 59 -133 155
  -188 192 l-38 26 0 1239 0 1240 -342 0 -343 0 -169 -337z" fill="white"/>
  <path d="M3810 6635 l0 -1365 678 -2 677 -3 3 -852 2 -853 345 0 345 0 0 2220
  0 2220 -1025 0 -1025 0 0 -1365z" fill="white"/>
  </g>
  <g transform="translate(0.000000,1350.000000) scale(0.100000,-0.100000)">
<path d="M6685 11589 c-261 -20 -591 -75 -870 -146 -827 -209 -1577 -620
-2180 -1194 -460 -438 -739 -803 -1017 -1324 -285 -536 -440 -1037 -550 -1780
-18 -127 -18 -963 0 -1090 42 -283 78 -473 123 -655 149 -605 392 -1140 753
-1660 175 -253 339 -442 618 -715 394 -386 738 -635 1213 -875 532 -270 969
-407 1610 -507 178 -27 186 -27 650 -28 505 0 489 -1 860 61 845 142 1660 519
2335 1079 207 172 531 503 702 716 562 701 907 1484 1048 2374 43 274 50 380
50 755 0 385 -8 493 -56 784 -145 883 -485 1649 -1042 2346 -186 232 -528 575
-756 758 -441 354 -893 612 -1420 807 -328 122 -721 216 -1130 271 -61 8 -250
19 -421 24 -345 11 -364 11 -520 -1z m700 -1009 c487 -31 1041 -189 1500 -429
379 -198 659 -405 976 -721 251 -250 428 -473 606 -765 293 -480 481 -1042
550 -1640 23 -205 23 -623 0 -835 -68 -613 -255 -1165 -564 -1669 -88 -143
-233 -351 -244 -351 -5 0 -55 42 -112 92 -94 86 -4374 4359 -5157 5150 l-345
349 25 20 c148 118 397 273 615 384 464 237 961 376 1510 424 103 9 420 4 640
-9z m-698 -4332 c1536 -1536 2793 -2798 2793 -2804 0 -15 -137 -117 -270 -201
-419 -266 -830 -439 -1291 -543 -589 -133 -1206 -129 -1809 11 -623 146 -1195
439 -1694 869 -128 110 -378 367 -477 490 -42 52 -113 146 -157 208 -870 1216
-981 2851 -283 4177 122 231 354 585 384 585 6 0 1267 -1256 2804 -2792z" fill="transparent"/>
</g>`;

  let tooltip;

  adSkipperButton.addEventListener("mouseenter", () => {
    tooltip = document.querySelector(
      ".ytp-tooltip.ytp-rounded-tooltip.ytp-bottom"
    );
    displayTooltipText(adSkipperButton);
    setTimeout(() => {
      if (tooltip) tooltip.style.removeProperty("display");
    }, 100);
  });

  adSkipperButton.addEventListener("mouseleave", () => {
    adSkipperButton.setAttribute("title", "Ads Skipper (a)");
    if (tooltip) tooltip.style.display = "none";
  });

  adSkipperButton.addEventListener("click", () => {
    const adSkipperButtonPressed = adSkipperButton.getAttribute("aria-enabled");
    const newStatus = adSkipperButtonPressed !== "true";

    adSkipperButton.setAttribute("aria-enabled", newStatus);
    if (newStatus) setPlayer();
    else unsetPlayer();
  });

  adSkipperButton.appendChild(svgElement);
  window.addEventListener("keydown", (event) => {
    if (event.key === "a") {
      adSkipperButton.click();
    }
  });

  return adSkipperButton;
};

const addResolutionBlurCheckbox = (checked) => {
  const settingMenu = document.querySelector(
    ".ytp-popup.ytp-settings-menu .ytp-panel-menu"
  );

  if (!settingMenu) {
    setTimeout(addResolutionBlurCheckbox, 100);
    return;
  }

  if (settingMenu.querySelector("#resolution-blur")) return;

  const resolutionBlurCheckbox = createResolutionBlurCheckbox(checked);

  resolutionBlurCheckbox.addEventListener("click", () => {
    const adSkipperButtonChecked =
      resolutionBlurCheckbox.getAttribute("aria-checked");
    const newStatus = adSkipperButtonChecked !== "true";

    resolutionBlurCheckbox.setAttribute("aria-checked", newStatus);
    if (newStatus) enableWindowListeners();
    else disableWindowListeners();
  });

  if(checked) enableWindowListeners();

  settingMenu.prepend(resolutionBlurCheckbox);
};

const addAdsSkipButton = (enabled) => {
  const rightControls = document.querySelector(".ytp-right-controls");
  if (rightControls.querySelector(".ytp-ads-button")) return;
  const adsSkipButton = createAdSkipper(enabled);
  if (enabled) setPlayer();
  rightControls.prepend(adsSkipButton);
};

const integrateButtons = () => {
  const player = document.querySelector(".html5-video-player");

  browser.runtime
    .sendMessage({ action: "getFeatureState", name: "adsSkipper" })
    .then((response) => {
      addAdsSkipButton(response);
      player.addEventListener("mousehover", () => {
        addAdsSkipButton(response);
      });
    });

  const settingsButton = document.querySelector(
    "button.ytp-button.ytp-settings-button"
  );

  browser.runtime
    .sendMessage({ action: "getFeatureState", name: "resolutionBlur" })
    .then((response) => {
      settingsButton.addEventListener("click", () => {
        setTimeout(() => {
          addResolutionBlurCheckbox(response);
        }, 100);
      });
    });
};

integrateButtons();
