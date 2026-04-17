/**
 * Xtense - Extension pour navigateur permettant la synchronisation avec OGSpy
 *
 * @author      OGSteam
 * @copyright   2026 OGSteam
 * @license     GNU GPL v2
 * @version     3.2.0
 */
document.addEventListener("DOMContentLoaded", () => {
  const grantBtn = document.getElementById("btn_grant_permission");
  const statusEl = document.getElementById("permission_status");
  if (!grantBtn || !statusEl) return;

  function updateStatus(granted) {
    if (granted) {
      statusEl.textContent = "\u2705 Acc\u00e8s serveur autoris\u00e9";
      statusEl.style.color = "green";
      grantBtn.style.display = "none";
    } else {
      statusEl.textContent = "\u26a0 Acc\u00e8s au serveur OGSpy requis";
      statusEl.style.color = "orange";
      grantBtn.style.display = "inline-block";
    }
  }

  // Check current permission state on popup open
  chrome.permissions.contains({ origins: ["https://*/*"] }, (granted) => {
    updateStatus(granted);
  });

  // Request permission on button click (requires a user gesture — popup click qualifies)
  grantBtn.addEventListener("click", () => {
    chrome.permissions.request(
      { origins: ["https://*/*", "http://*/*"] },
      (granted) => {
        if (granted) {
          updateStatus(true);
        } else {
          statusEl.textContent = "\u274c Permission refus\u00e9e";
          statusEl.style.color = "red";
          grantBtn.style.display = "inline-block";
        }
      }
    );
  });
});
