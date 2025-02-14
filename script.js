// Data
const chargeList = [
    { name: "Theft", fine: 100, time: 5 },
    { name: "Assault", fine: 200, time: 10 },
    { name: "Murder", fine: 1000, time: 50 },
  ];
  
  // State
  let charges = [];
  let totalFine = 0;
  let totalJailTime = 0;
  let reduction = 0;
  
  // DOM Elements
  const errorDiv = document.getElementById("error");
  const reportTitleInput = document.getElementById("reportTitle");
  const suspectInput = document.getElementById("suspect");
  const characterIdInput = document.getElementById("characterId");
  const mugshotInput = document.getElementById("mugshot");
  const jobInput = document.getElementById("job");
  const reportDetailsTextarea = document.getElementById("reportDetails");
  const chargeSelect = document.getElementById("chargeSelect");
  const reductionSelect = document.getElementById("reductionSelect");
  const addChargeButton = document.getElementById("addCharge");
  const chargesList = document.getElementById("chargesList");
  const totalFineSpan = document.getElementById("totalFine");
  const totalJailTimeSpan = document.getElementById("totalJailTime");
  const serverIdInput = document.getElementById("serverId");
  const submitButton = document.getElementById("submitReport");
  
  // Add Charge Function
  addChargeButton.addEventListener("click", () => {
    const selectedChargeName = chargeSelect.value;
  
    if (!selectedChargeName) {
      showError("Please select a charge before adding.");
      return;
    }
  
    const charge = chargeList.find((c) => c.name === selectedChargeName);
    if (charge) {
      charges.push(charge);
      updateTotals();
      updateUI();
      clearError();
    }
  });
  
  // Update Totals Function
  function updateTotals() {
    const totalReduction = reduction / 100;
    const totalFineBeforeReduction = charges.reduce((sum, c) => sum + c.fine, 0);
    const totalJailTimeBeforeReduction = charges.reduce((sum, c) => sum + c.time, 0);
  
    totalFine = totalFineBeforeReduction * (1 - totalReduction);
    totalJailTime = totalJailTimeBeforeReduction * (1 - totalReduction);
  }
  
  // Reduction Select Change Event
  reductionSelect.addEventListener("change", (e) => {
    reduction = parseInt(e.target.value);
    updateTotals();
    updateUI();
  });
  
  // Copy to Clipboard Function
  function copyToClipboard(type) {
    let text = "";
    if (type === "fine") {
      text = `/fine ${serverIdInput.value} ${totalFine.toFixed(2)}`;
    } else if (type === "jailTime") {
      text = `/jail ${serverIdInput.value} ${totalJailTime.toFixed(2)}`;
    }
    navigator.clipboard.writeText(text).then(() => {
      alert(`Copied to clipboard: ${text}`);
    });
  }
  
  // Submit Report Function
  submitButton.addEventListener("click", async () => {
    const reportTitle = reportTitleInput.value.trim();
    const suspect = suspectInput.value.trim();
    const characterId = characterIdInput.value.trim();
    const mugshot = mugshotInput.value.trim();
    const job = jobInput.value.trim();
    const reportDetails = reportDetailsTextarea.value.trim();
    const serverId = serverIdInput.value.trim();
  
    if (!reportTitle || !suspect || !characterId || !mugshot || !job || !reportDetails || !serverId) {
      showError("Please fill in all fields before submitting.");
      return;
    }
  
    // Prepare data for Discord webhook
    const reportData = {
      reportTitle,
      suspect,
      characterId,
      mugshot,
      job,
      charges,
      totalFine,
      totalJailTime,
      reportDetails,
      serverId,
    };
  
    // Send data to Discord webhook
    try {
      const webhookUrl = "https://discord.com/api/webhooks/1340091788177838080/8VrhvflUGibVA9lNF_5YB_XScoq6gJcFuQ_4cRTLFd070xAsnO-yWPNl_DhKin9G29Z1";
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: "New Sheriff Arrest Report Submitted!",
          embeds: [
            {
              title: reportTitle,
              fields: [
                { name: "Suspect", value: suspect, inline: true },
                { name: "Character ID", value: characterId, inline: true },
                { name: "Job", value: job, inline: true },
                { name: "Server ID", value: serverId, inline: true },
                { name: "Total Fine", value: `$${totalFine.toFixed(2)}`, inline: true },
                { name: "Jail Time", value: `${totalJailTime.toFixed(2)} minutes`, inline: true },
                { name: "Report Details", value: reportDetails },
                {
                  name: "Charges",
                  value: charges
                    .map((c) => `${c.name} - Fine: $${c.fine.toFixed(2)}, Time: ${c.time.toFixed(2)} mins`)
                    .join("\n"),
                },
              ],
              image: { url: mugshot },
              color: 0x8b7355, // Brown color for the embed
            },
          ],
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to send report to Discord.");
      }
  
      // Reset form
      charges = [];
      totalFine = 0;
      totalJailTime = 0;
      reduction = 0;
      reportTitleInput.value = "";
      suspectInput.value = "";
      characterIdInput.value = "";
      mugshotInput.value = "";
      jobInput.value = "";
      reportDetailsTextarea.value = "";
      serverIdInput.value = "";
      chargeSelect.value = "";
      reductionSelect.value = "0";
      updateUI();
      clearError();
  
      alert("Report submitted successfully!");
    } catch (error) {
      console.error(error);
      showError("Failed to submit the report. Please try again.");
    }
  });
  
  // Helper Functions
  function updateUI() {
    // Update charges list
    chargesList.innerHTML = charges
      .map(
        (c) =>
          `<li>${c.name} - Fine: $${c.fine.toFixed(2)}, Jail Time: ${c.time.toFixed(2)} minutes</li>`
      )
      .join("");
  
    // Update totals
    totalFineSpan.textContent = totalFine.toFixed(2);
    totalJailTimeSpan.textContent = totalJailTime.toFixed(2);
  }
  
  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove("hidden");
  }
  
  function clearError() {
    errorDiv.textContent = "";
    errorDiv.classList.add("hidden");
  }