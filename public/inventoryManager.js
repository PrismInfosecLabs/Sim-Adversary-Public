// inventoryManager.js - Inventory management for the cybersecurity game

class InventoryManager {
  constructor(credentials, itemLinks) {
    this.CREDENTIALS = credentials;
    this.ITEM_LINKS = itemLinks || {};
  }

  /**
   * Add item to player inventory
   * @param {Array} inventory - Player's inventory array
   * @param {string} item - Item to add
   * @returns {boolean} Whether item was added (true) or already existed (false)
   */
  addToInventory(inventory, item) {
    if (this.isCredential(item)) {
      // Remove any existing credential of the same base type
      this.removeBaseCredential(inventory, this.getBaseCredentialType(item));
    }
    
    if (!inventory.includes(item)) {
      inventory.push(item);
      this.updateInventoryDisplay(inventory);
      return true;
    }
    return false;
  }

  /**
   * Remove item from player inventory
   * @param {Array} inventory - Player's inventory array
   * @param {string} item - Item to remove
   * @returns {boolean} Whether item was removed (true) or didn't exist (false)
   */
  removeFromInventory(inventory, item) {
    const index = inventory.indexOf(item);
    if (index > -1) {
      inventory.splice(index, 1);
      this.updateInventoryDisplay(inventory);
      return true;
    }
    return false;
  }

  /**
   * Check if player has a specific item
   * @param {Array} inventory - Player's inventory array
   * @param {string} item - Item to check for
   * @returns {boolean} Whether player has the item
   */
  hasItem(inventory, item) {
    return inventory.includes(item);
  }

  /**
   * Check if player meets requirements for an action
   * @param {Array} inventory - Player's inventory array
   * @param {Array} requiredItems - Required items array (can contain OR arrays)
   * @returns {boolean} Whether requirements are met
   */
  meetsRequirements(inventory, requiredItems) {
    if (!requiredItems) return true;

    return requiredItems.every((item) => {
      if (Array.isArray(item)) {
        // OR requirement - player needs at least one item from the array
        return item.some((subItem) => this.hasItem(inventory, subItem));
      } else {
        // Single requirement
        return this.hasItem(inventory, item);
      }
    });
  }

  /**
   * Check if an item is a credential
   * @param {string} item - Item to check
   * @returns {boolean} Whether item is a credential
   */
  isCredential(item) {
    return Object.values(this.CREDENTIALS).includes(item);
  }

  /**
   * Get the base credential type for a credential item
   * @param {string} credential - Credential item
   * @returns {string|null} Base credential type or null
   */
  getBaseCredentialType(credential) {
    for (const key in this.CREDENTIALS) {
      if (this.CREDENTIALS[key] === credential) {
        return this.CREDENTIALS[key];
      }
    }
    return null;
  }

  /**
   * Remove all credentials of the same base type from inventory
   * @param {Array} inventory - Player's inventory array
   * @param {string} baseType - Base credential type to remove
   */
  removeBaseCredential(inventory, baseType) {
    for (let i = inventory.length - 1; i >= 0; i--) {
      if (this.getBaseCredentialType(inventory[i]) === baseType) {
        inventory.splice(i, 1);
      }
    }
  }

  /**
   * Update the visual inventory display in the UI
   * @param {Array} inventory - Player's inventory array
   */
  updateInventoryDisplay(inventory) {
    const list = document.getElementById("inventory-list");
    if (!list) {
      console.warn("Inventory list element not found");
      return;
    }

    list.innerHTML = ""; // Clear old list
    
    if (inventory.length === 0) {
      const emptyItem = document.createElement("li");
      emptyItem.textContent = "No items";
      emptyItem.style.fontStyle = "italic";
      emptyItem.style.color = "#888";
      list.appendChild(emptyItem);
      return;
    }

    inventory.forEach(item => {
      const li = document.createElement("li");
      
      if (this.ITEM_LINKS[item]) {
        const link = document.createElement("a");
        link.href = this.ITEM_LINKS[item];
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = item + " 📄";
        link.style.color = "#64b5f6";
        li.appendChild(link);
      } else {
        li.textContent = item;
      }
      
      list.appendChild(li);
    });
  }

  /**
   * Get inventory summary for display
   * @param {Array} inventory - Player's inventory array
   * @returns {string} Formatted inventory string
   */
  getInventorySummary(inventory) {
    if (inventory.length === 0) {
      return "No items";
    }
    return inventory.join(", ");
  }

  /**
   * Get inventory items by category
   * @param {Array} inventory - Player's inventory array
   * @returns {Object} Categorized inventory items
   */
  getCategorizedInventory(inventory) {
    const categorized = {
      credentials: [],
      tools: [],
      information: [],
      access: [],
      other: []
    };

    inventory.forEach(item => {
      if (this.isCredential(item)) {
        categorized.credentials.push(item);
      } else if (item.toLowerCase().includes('tool') || 
                 item.toLowerCase().includes('exploit')) {
        categorized.tools.push(item);
      } else if (item.toLowerCase().includes('information') || 
                 item.toLowerCase().includes('list') || 
                 item.toLowerCase().includes('report')) {
        categorized.information.push(item);
      } else if (item.toLowerCase().includes('access') || 
                 item.toLowerCase().includes('foothold') || 
                 item.toLowerCase().includes('session')) {
        categorized.access.push(item);
      } else {
        categorized.other.push(item);
      }
    });

    return categorized;
  }

  /**
   * Validate inventory state (for debugging)
   * @param {Array} inventory - Player's inventory array
   * @returns {Object} Validation results
   */
  validateInventory(inventory) {
    const validation = {
      valid: true,
      issues: [],
      duplicates: [],
      unknownItems: []
    };

    // Check for duplicates
    const seen = new Set();
    inventory.forEach(item => {
      if (seen.has(item)) {
        validation.duplicates.push(item);
        validation.valid = false;
      }
      seen.add(item);
    });

    // Check for multiple credentials of the same type
    const credentialTypes = new Set();
    inventory.forEach(item => {
      if (this.isCredential(item)) {
        const baseType = this.getBaseCredentialType(item);
        if (credentialTypes.has(baseType)) {
          validation.issues.push(`Multiple credentials of type: ${baseType}`);
          validation.valid = false;
        }
        credentialTypes.add(baseType);
      }
    });

    return validation;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InventoryManager;
} else if (typeof window !== 'undefined') {
  window.InventoryManager = InventoryManager;
}