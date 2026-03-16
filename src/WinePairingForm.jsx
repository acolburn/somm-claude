import { useState } from "react";
import ClaudeResults from "./ClaudeResults.jsx";

export default function WinePairingForm() {
  //   const [selections, setSelections] = useState({
  //     protein: [],
  //     sauce: [],
  //     intensity: [],
  //     richness: [],
  //     flavors: [],
  //     cooking: [],
  //   });

  const [wineRecommendations, setWineRecommendations] = useState("");

  const categories = {
    protein: [
      "Beef",
      "Pork",
      "Chicken",
      "Fish/Seafood",
      "Lamb",
      "Vegetarian/Vegan",
      "Mixed proteins",
    ],
    sauce: [
      "Cheesy",
      "Tomato-based",
      "Cream/butter sauce",
      "Oil/herb-based",
      "Meat gravy",
      "Spicy/chili-based",
      "Sweet glaze or BBQ sauce",
      "Vinegar or acidic",
      "No sauce (plain/grilled)",
    ],
    intensity: ["Mild/delicate", "Moderate", "Bold/strong"],
    richness: ["Light", "Medium", "Rich/heavy"],
    flavors: [
      "Smoky",
      "Garlic-heavy",
      "Herbal",
      "Citrus/bright",
      "Earthy",
      "Spicy/hot",
      "Sweet",
      "Umami/savory",
      "Charred/grilled",
    ],
    cooking: [
      "Grilled",
      "Roasted",
      "Sautéed",
      "Braised/stewed",
      "Fried",
      "Raw/fresh",
    ],
  };

  function makeProteinCheckboxes() {
    return categories.protein.map((protein) => {
      return (
        <label key={protein}>
          <input type="checkbox" name="protein" value={protein} />
          {protein}
          <br />
        </label>
      );
    });
  }

  function makeSauceCheckboxes() {
    return categories.sauce.map((sauce) => {
      return (
        <label key={sauce}>
          <input type="checkbox" name="sauce" value={sauce} />
          {sauce}
          <br />
        </label>
      );
    });
  }

  function makeIntensityCheckboxes() {
    return categories.intensity.map((intensity) => {
      return (
        <label key={intensity}>
          <input type="checkbox" name="intensity" value={intensity} />
          {intensity}
          <br />
        </label>
      );
    });
  }

  function makeRichnessCheckboxes() {
    return categories.richness.map((richness) => {
      return (
        <label key={richness}>
          <input type="checkbox" name="richness" value={richness} />
          {richness}
          <br />
        </label>
      );
    });
  }

  function makeFlavorCheckboxes() {
    return categories.flavors.map((flavor) => {
      return (
        <label key={flavor}>
          <input type="checkbox" name="flavors" value={flavor} />
          {flavor}
          <br />
        </label>
      );
    });
  }

  function makeCookingCheckboxes() {
    return categories.cooking.map((method) => {
      return (
        <label key={method}>
          <input type="checkbox" name="cooking" value={method} />
          {method}
          <br />
        </label>
      );
    });
  }

  function getAWine(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
      protein: formData.getAll("protein"),
      sauce: formData.getAll("sauce"),
      intensity: formData.getAll("intensity"),
      richness: formData.getAll("richness"),
      flavors: formData.getAll("flavors"),
      cooking: formData.getAll("cooking"),
      additionalInfo: formData.get("additional-info"),
    };
    createClaudePrompt(data);
  }

  function createClaudePrompt(data) {
    let result =
      "You are an expert sommelier. Help me find the perfect wine pairing for my meal. Here are the details:\n\n";
    for (const [key, value] of Object.entries(data)) {
      // Returning results only from non-empty categories
      // (arrayLength>0 for arrays, not empty string for additionalInfo)
      const isArray = Array.isArray(value);
      const hasContent = isArray ? value.length > 0 : value?.trim().length > 0;
      if (key === "additionalInfo" && hasContent) {
        result += `Additional info: ${value}\n`;
      } else if (isArray && hasContent) {
        result += `${key}: ${value.join(", ")}\n`;
      }
    }
    result +=
      "\nBased on this information, recommend a wine pairing that is widely available in stores \
    like Total Wine or BevMo. Be as specific as possible. In addition, recommend a wine pairing that \
    is more of a splurge. In both cases, explain your reasoning in a sentence or two. Format your \
    response in markdown to make it easier to render to a web page.";
    callClaude(result);
  }

  async function callClaude(myPrompt) {
    try {
      // Send the prompt to your Netlify Function
      const response = await fetch(
        "/.netlify/functions/getWineRecommendations",
        {
          method: "POST",
          body: JSON.stringify({ myPrompt }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (err) {
        throw new Error(
          `Unexpected function response: ${err.message}. Response text: ${text}`,
        );
      }

      if (response.ok) {
        // console.log("Wine recommendation:", result.winePairing);
        setWineRecommendations(result.winePairing);
      } else {
        console.error("Error:", result.error);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }

  return (
    <section className="wine-form-container">
      <h1>What wine pairs well with my meal?</h1>
      <p>
        Choose the dish elements you'd like to pair with wine:
      </p>
      <form onSubmit={getAWine}>
        <fieldset>
          <legend>What proteins are we featuring?</legend>
          {makeProteinCheckboxes()}
        </fieldset>
        <fieldset>
          <legend>What kinds of sauces are we using?</legend>
          {makeSauceCheckboxes()}
        </fieldset>
        <fieldset>
          <legend>How intense are the flavors?</legend>
          {makeIntensityCheckboxes()}
        </fieldset>
        <fieldset>
          <legend>How rich or heavy is the food?</legend>
          {makeRichnessCheckboxes()}
        </fieldset>
        <fieldset>
          <legend>What kinds of flavors are present?</legend>
          {makeFlavorCheckboxes()}
        </fieldset>
        <fieldset>
          <legend>How is the main item cooked?</legend>
          {makeCookingCheckboxes()}
        </fieldset>
        <label htmlFor="additional-info">
          Anything else Claude should know? <br />
        </label>
        <textarea id="additional-info" name="additional-info"></textarea>
        <button>Find Me A Wine!</button>
      </form>
      {wineRecommendations && <ClaudeResults wines={wineRecommendations} />}
    </section>
  );
}
