// ===== ITEM SYSTEM =====
class GameWorldItem {
    constructor(name, description, initialLocation) {
      this.name = name;
      this.description = description;
      this.currentLocation = initialLocation;
      this.isActive = false;
    }
  
    use() {
      return `${this.name} does nothing special.`;
    }
  }
  
  class Lamp extends GameWorldItem {
    constructor() {
      super("lamp", "A rusty lantern. It flickers weakly.", "beach");
    }
  
    use() {
      this.isActive = !this.isActive;
      return `You ${this.isActive ? "light" : "extinguish"} the lamp.`;
    }
  }
  
  class Key extends GameWorldItem {
    constructor() {
      super("shedKey", "A tarnished key labeled 'Lighthouse Shed'.", "diner");
    }
  
    use() {
      return "Find a lock to use this key.";
    }
  }
  
  class Radio extends GameWorldItem {
    constructor() {
      super("radio", "A broken handheld radio.", "radioTower");
      this.hasBatteries = false;
    }
  }
  
  class WorkingRadio extends GameWorldItem {
    constructor() {
      super("workingRadio", "A radio powered by batteries. Tuned to 103.7.", "inventory");
      this.frequency = "103.7";
    }
  
    use() {
      return "A voice whispers: 'The bunker code is 3-7-1...'";
    }
  }
  
  // ===== GAME DATA =====
  const gameData = {
    items: {
      lamp: new Lamp(),
      shedKey: new Key(),
      radio: new Radio(),
      workingRadio: new WorkingRadio(),
      batteries: new GameWorldItem("batteries", "A pair of corroded AA batteries.", "hardwareStore"),
      boltCutters: new GameWorldItem("boltCutters", "Rusted but still sharp.", "hardwareStore")
    },
    locations: {
      beach: {
        description: "Cold waves gnaw at the shore. A rusted lantern lies in the sand.",
        darkDescription: "The moonless night swallows everything. You need light.",
        items: ["lamp"],
        choices: [
          { text: "Go to Town Square", target: "townSquare" },
          { 
            text: "Take Lantern", 
            action: "addItem", 
            item: "lamp",
            newDescription: "Cold waves gnaw at the shore." 
          }
        ]
      },
      townSquare: {
        description: "A deserted square. A flickering streetlight casts long shadows.",
        choices: [
          { text: "Enter Diner", target: "diner" },
          { text: "Follow Flickering Light", target: "radioTower" },
          { text: "Enter Hardware Store", target: "hardwareStore" },
          { text: "Enter the Funhouse", target: "funhouse" }
        ]
      },
      hardwareStore: {
        description: "Shelves lined with rusted tools. A pair of batteries and bolt cutters sit on the counter.",
        items: ["batteries", "boltCutters"],
        choices: [
          { 
            text: "Take Batteries", 
            action: "addItem", 
            item: "batteries",
            newDescription: "Shelves lined with rusted tools. The bolt cutters remain." 
          },
          { 
            text: "Take Bolt Cutters", 
            action: "addItem", 
            item: "boltCutters",
            newDescription: "Shelves lined with rusted tools. The batteries remain." 
          },
          { text: "Return to Town Square", target: "townSquare" }
        ]
      },
      diner: {
        description: "The diner reeks of mildew. A broken jukebox flickers in the corner.",
        items: ["shedKey"],
        choices: [
          { 
            text: "Search Counter", 
            action: "addItem", 
            item: "shedKey",
            newDescription: "The diner reeks of mildew. The counter is empty now."
          },
          { text: "Exit to Alley", target: "alley" },
          { text: "Return to Town Square", target: "townSquare" }
        ]
      },
      alley: {
        description: "A narrow alley choked with trash. A chain-link gate blocks the far end.",
        choices: [
          { 
            text: "Cut the Chain-Link Fence", 
            action: function() {
              if (inventory.includes("boltCutters")) {
                inventory = inventory.filter(item => item !== "boltCutters");
                currentLocation = "sewerEntrance";
                gameData.locations.alley.description = "The fence groans as it falls open, revealing a sewer grate.";
                render();
              } else {
                alert("You need bolt cutters to cut through this fence!");
              }
            }
          },
          { text: "Return to Diner", target: "diner" }
        ]
      },
      sewerEntrance: {
        description: "A dark sewer grate yawns open. The stench of salt and decay wafts up.",
        choices: [
          { text: "Descend into the sewers", target: "bunkerDoor" },
          { text: "Return to Alley", target: "alley" }
        ]
      },
      radioTower: {
        description: "A skeletal tower hums with static. A radio sits on a table.",
        darkDescription: "The tower is pitch black. You can't see a thing.",
        requiresLight: true,
        items: ["radio"],
        choices: [
          { 
            text: "Take Radio", 
            action: "addItem", 
            item: "radio",
            newDescription: "A skeletal tower hums with static."
          },
          { text: "Return to Town", target: "townSquare" }
        ]
      },
      funhouse: {
        description: "Mirrors warp your reflection. Exits shift unpredictably.",
        randomExits: ["townSquare", "beach", "diner", "alley", "radioTower"],
        choices: [
          { text: "Try to find an exit", action: "randomExit" }
        ]
      },
      bunkerDoor: {
        description: "A heavy steel door with a keypad. It's locked.",
        choices: [
          { 
            text: "Enter code", 
            action: "inputCode",
            requiresItem: "workingRadio"
          },
          { text: "Go back", target: "sewerEntrance" }
        ]
      },
      bunkerInside: {
        description: "The bunker walls are lined with decaying experiment logs. A final message flashes: 'THEY'RE IN THE WATER'",
        choices: [
          { 
            text: "Destroy the lab", 
            action: "ending", 
            endingText: "An explosion rocks the coast. The static fades forever..." 
          },
          { 
            text: "Flee to the beach", 
            action: "ending",
            endingText: "You escape to the shore, but the fog follows. The whispers never stop...",
            specialEnding: true
          }
        ]
      }
    }
  };
  
  // ===== GAME STATE =====
  let currentLocation = "beach";
  let inventory = [];
  let previousLocation = null;
  let takenItems = [];
  let locationHistory = [];
  
  // ===== ITEM COMBINATION CHECK =====
  function checkCombinations() {
    if (inventory.includes("radio") && inventory.includes("batteries")) {
      inventory = inventory.filter(item => !["radio", "batteries"].includes(item));
      inventory.push("workingRadio");
      alert("You combined the radio and batteries into a working radio!");
      render();
    }
  }
  
  // ===== CODE INPUT HANDLER =====
  function handleCodeInput() {
    const code = prompt("Enter the bunker code (you heard it on the radio):");
    if (code === "371" || code === "3-7-1" || code === "3 7 1") {
      currentLocation = "bunkerInside";
      render();
    } else {
      alert("Incorrect code. The door remains locked.");
    }
  }
  
  // ===== NAVIGATION FUNCTIONS =====
  function goBack() {
    if (locationHistory.length > 0) {
      currentLocation = locationHistory.pop();
      render();
    }
  }
  
  function handleChoice(choice) {
    // Save to history before changing locations
    if (choice.target || choice.action === "randomExit") {
      locationHistory.push(currentLocation);
    }
  
    // Handle function actions
    if (typeof choice.action === 'function') {
      choice.action();
      return;
    }
  
    // Add item to inventory
    if (choice.action === "addItem" && !takenItems.includes(choice.item)) {
      inventory.push(choice.item);
      takenItems.push(choice.item);
      gameData.items[choice.item].currentLocation = "inventory";
      checkCombinations();
    }
  
    // Remove item
    if (choice.action === "removeItem") {
      inventory = inventory.filter(item => item !== choice.item);
    }
  
    // Random exit
    if (choice.action === "randomExit") {
      const possibleExits = gameData.locations[currentLocation].randomExits;
      currentLocation = possibleExits[Math.floor(Math.random() * possibleExits.length)];
    }
  
    // Code input
    if (choice.action === "inputCode") {
      handleCodeInput();
      return;
    }
  
    // Ending
    if (choice.action === "ending") {
      document.getElementById("description").textContent = choice.endingText;
      document.getElementById("choices").innerHTML = "";
      document.getElementById("item-actions").innerHTML = "";
      
      // Add restart button for special ending
      if (choice.specialEnding) {
        const restartButton = document.createElement("button");
        restartButton.textContent = "Try again?";
        restartButton.onclick = () => {
          // Reset game state
          currentLocation = "beach";
          inventory = [];
          takenItems = [];
          locationHistory = [];
          // Reset descriptions
          gameData.locations.alley.description = "A narrow alley choked with trash. A chain-link gate blocks the far end.";
          render();
        };
        document.getElementById("choices").appendChild(restartButton);
      }
      return;
    }
  
    // Update description
    if (choice.newDescription) {
      gameData.locations[currentLocation].description = choice.newDescription;
    }
  
    // Move to new location
    if (choice.target) {
      currentLocation = choice.target;
    }
  
    render();
  }
  
  // ===== RENDER FUNCTION =====
  function render() {
    const location = gameData.locations[currentLocation];
    const lamp = gameData.items.lamp;
  
    // Handle darkness
    if (location.requiresLight && (!inventory.includes("lamp") || !lamp.isActive)) {
      document.getElementById("description").textContent = location.darkDescription || "You can't see anything.";
      document.getElementById("choices").innerHTML = 
        `<button onclick="goBack()">Go back</button>`;
      return;
    }
  
    // Update description (remove references to taken items)
    let description = location.description;
    if (location.items) {
      location.items.forEach(itemName => {
        if (takenItems.includes(itemName)) {
          const item = gameData.items[itemName];
          description = description.replace(item.description, "");
        }
      });
    }
    document.getElementById("description").textContent = description.trim();
  
    // Render choices
    const choicesEl = document.getElementById("choices");
    choicesEl.innerHTML = "";
    
    // Add location-specific choices
    location.choices.forEach(choice => {
      if (choice.action === "addItem" && takenItems.includes(choice.item)) {
        return;
      }
      
      const button = document.createElement("button");
      button.textContent = choice.text;
      
      if (choice.requiresItem && !inventory.includes(choice.requiresItem)) {
        button.disabled = true;
      }
      
      button.onclick = () => handleChoice(choice);
      choicesEl.appendChild(button);
    });
  
    // Add inventory
    document.getElementById("inventory").innerHTML = 
      `<strong>Inventory:</strong> ${inventory.join(", ") || "Empty"}`;
  
    // Add item actions
    const actionsEl = document.getElementById("item-actions");
    actionsEl.innerHTML = "";
    inventory.forEach(itemName => {
      const item = gameData.items[itemName];
      const button = document.createElement("button");
      button.textContent = `Use ${item.name}`;
      button.onclick = () => {
        const result = item.use();
        alert(result);
        render();
      };
      if (item.isActive) button.classList.add("item-active");
      actionsEl.appendChild(button);
    });
  
    // Show back button (except in funhouse or beach)
    if (currentLocation !== "beach" && currentLocation !== "funhouse" && currentLocation !== "bunkerInside") {
      const backButton = document.createElement("button");
      backButton.textContent = "Go back";
      backButton.onclick = goBack;
      choicesEl.appendChild(backButton);
    }
  }
  
  // ===== START GAME =====
  render();