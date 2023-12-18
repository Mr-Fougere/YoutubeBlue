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
  adSkipperButton.setAttribute("data-title-no-tooltip", "Ads");
  adSkipperButton.setAttribute("aria-enabled", enabled);
  adSkipperButton.setAttribute("aria-label", "Ads Keyshortcut a");
  adSkipperButton.setAttribute("title", "Ads (a)");

  const svgElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  svgElement.setAttribute("width", "100%");
  svgElement.setAttribute("height", "100%");
  svgElement.setAttribute("version", "1.1");
  svgElement.setAttribute("viewBox", "0 0 1688.000000 1688.000000");
  svgElement.innerHTML = ` <g transform="translate(0, 1518.2) scale(0.08, -0.08)" stroke="none">
  <path d="M11412 11787 c-101 -199 -202 -393 -225 -431 l-42 -69 -245 -106
  c-135 -58 -802 -344 -1482 -636 l-1238 -530 3 -1719 2 -1720 1150 -493 c633
  -271 1298 -557 1479 -635 l329 -143 39 -60 c21 -33 121 -225 223 -428 l186
  -367 435 0 434 0 0 1553 0 1552 45 28 c59 37 178 157 225 227 55 81 97 169
  122 257 31 105 33 340 4 448 -22 83 -72 196 -114 257 -48 70 -166 192 -227
  233 l-55 38 0 1554 0 1553 -432 0 -433 0 -183 -363z" fill="white"/>
  <path d="M4760 8295 l0 -1715 843 0 844 0 6 -382 c4 -211 7 -690 7 -1065 l0
  -683 435 0 435 0 0 2780 0 2780 -1285 0 -1285 0 0 -1715z" fill="white"/>
  </g>
  <g transform="translate(0, 1518.2) scale(0.08, -0.08)" stroke="none">
<path d="M4876 11864 l-439 -443 39 -48 c21 -26 505 -511 1074 -1077 569 -567
2187 -2181 3595 -3587 1408 -1407 2641 -2633 2740 -2726 99 -92 226 -212 282
-266 57 -54 108 -97 115 -95 12 4 742 977 755 1007 3 7 -2 18 -11 23 -10 6
-50 37 -89 71 -40 33 -1685 1672 -3657 3642 -3434 3430 -3953 3947 -3961 3943
-2 0 -202 -200 -443 -444z" fill="transparent"/>
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
    adSkipperButton.setAttribute("title", "Ads (a)");
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
    setTimeout(() => {
      addResolutionBlurCheckbox(checked);
    }, 100);
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

  if (checked) enableWindowListeners();

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
  browser.runtime
    .sendMessage({ action: "getFeatureState", name: "adsSkipper" })
    .then((response) => {
      if (!videoPlayer) return;
      addAdsSkipButton(response);
      videoPlayer.value.addEventListener("mousehover", () => {
        addAdsSkipButton(response);
      });
    });

  const settingsButton = document.querySelector(
    "button.ytp-button.ytp-settings-button"
  );

  browser.runtime
    .sendMessage({ action: "getFeatureState", name: "resolutionBlur" })
    .then((response) => {
      if (!settingsButton) return;

      settingsButton.addEventListener("click", () => {
        setTimeout(() => {
          addResolutionBlurCheckbox(response);
        }, 100);
      });
    });
};
