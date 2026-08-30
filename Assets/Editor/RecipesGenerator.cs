using UnityEngine;
using UnityEditor;

/// <summary>
/// Generates crafting recipes for Emberroot.
/// Run via menu: Emberroot > Generate Recipes
/// </summary>
public static class RecipesGenerator
{
    [MenuItem("Emberroot/Generate Recipes")]
    public static void GenerateAll()
    {
        EnsureFolder("Assets/Resources/Data/Recipes");

        // --- Tier 1: Forest ---
        CreateRecipe("recipe_iron_sword", "Iron Sword",
            "Forge an iron sword from raw materials.",
            new string[] { "item_wooden_sword" }, new int[] { 1 },
            "item_iron_sword", 1, "", 0);

        CreateRecipe("recipe_stamina_elixir", "Stamina Elixir",
            "Distill herbs into a stamina-restoring brew.",
            new string[] { "item_health_potion" }, new int[] { 2 },
            "item_stamina_elixir", 1, "", 0);

        CreateRecipe("recipe_antidote", "Antidote",
            "Craft a remedy for poison.",
            new string[] { "item_health_potion" }, new int[] { 1 },
            "item_antidote", 2, "", 0);

        // --- Tier 2: Mines ---
        CreateRecipe("recipe_flame_blade", "Flame Blade",
            "Infuse a blade with embers. Requires Fire Arrow skill.",
            new string[] { "item_iron_sword" }, new int[] { 1 },
            "item_flame_blade", 1, "fire_arrow", 2);

        CreateRecipe("recipe_chainmail", "Chainmail",
            "Interlock iron rings into protective armor.",
            new string[] { "item_leather_armor" }, new int[] { 1 },
            "item_chainmail", 1, "", 1);

        CreateRecipe("recipe_greater_health_potion", "Greater Health Potion",
            "Brew a powerful healing potion.",
            new string[] { "item_health_potion" }, new int[] { 3 },
            "item_greater_health_potion", 1, "", 1);

        // --- Tier 3: Peak ---
        CreateRecipe("recipe_obsidian_axe", "Obsidian Axe",
            "Forge volcanic glass into a devastating weapon.",
            new string[] { "item_iron_sword" }, new int[] { 2 },
            "item_obsidian_axe", 1, "", 3);

        CreateRecipe("recipe_crystal_plate", "Crystal Plate",
            "Forge crystal-infused armor. Requires Storehouse.",
            new string[] { "item_chainmail" }, new int[] { 1 },
            "item_crystal_plate", 1, "", 2);

        // --- Tier 4: Swamp ---
        CreateRecipe("recipe_venom_fang", "Venom Fang Dagger",
            "Coat a dagger in concentrated swamp venom.",
            new string[] { "item_iron_sword" }, new int[] { 1 },
            "item_venom_fang", 1, "", 2);

        CreateRecipe("recipe_bogweave_robe", "Bogweave Robe",
            "Weave marsh reeds into a protective garment.",
            new string[] { "item_leather_armor" }, new int[] { 2 },
            "item_bogweave_robe", 1, "", 2);

        CreateRecipe("recipe_frost_remedy", "Frost Remedy",
            "Brew a remedy from swamp crystals to cure freeze.",
            new string[] { "item_antidote" }, new int[] { 2 },
            "item_frost_remedy", 2, "", 1);

        // --- Tier 5: Skylands ---
        CreateRecipe("recipe_storm_blade", "Storm Blade",
            "Forge sky metal with lightning enchantment.",
            new string[] { "item_flame_blade", "item_crystal_bow" }, new int[] { 1, 1 },
            "item_storm_blade", 1, "", 4);

        CreateRecipe("recipe_aether_plate", "Aether Plate",
            "Forge cloud metal into featherweight armor.",
            new string[] { "item_crystal_plate" }, new int[] { 1 },
            "item_aether_plate", 1, "", 4);

        CreateRecipe("recipe_elixir_of_life", "Elixir of Life",
            "The ultimate healing potion. Fully restores HP.",
            new string[] { "item_greater_health_potion" }, new int[] { 3 },
            "item_elixir_of_life", 1, "", 3);

        // --- Tier 6: Shadow Realm ---
        CreateRecipe("recipe_void_reaper", "Void Reaper",
            "Forge a scythe from shadow-infused metal.",
            new string[] { "item_storm_blade" }, new int[] { 1 },
            "item_void_reaper", 1, "", 5);

        CreateRecipe("recipe_shadow_cloak", "Shadow Cloak",
            "Weave shadows into a protective cloak.",
            new string[] { "item_aether_plate" }, new int[] { 1 },
            "item_shadow_cloak", 1, "", 5);

        CreateRecipe("recipe_curse_scroll", "Scroll of Purification",
            "Inscribe ancient runes to create a curse-cleansing scroll.",
            new string[] { "item_frost_remedy" }, new int[] { 3 },
            "item_curse_scroll", 1, "", 4);

        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();
        Debug.Log("[RecipesGenerator] 18 recipes created");
    }

    static void CreateRecipe(string id, string name, string desc,
        string[] ingredientIDs, int[] ingredientAmounts,
        string resultID, int resultAmount,
        string requiredSkill, int requiredVillageStage)
    {
        var recipe = ScriptableObject.CreateInstance<Emberroot.CraftingRecipe>();
        recipe.recipeID = id;
        recipe.displayName = name;
        recipe.description = desc;
        recipe.resultAmount = resultAmount;
        recipe.requiredSkillID = requiredSkill;
        recipe.requiredVillageStage = requiredVillageStage;

        recipe.resultItem = LoadItem(resultID);

        recipe.ingredients = new Emberroot.CraftingIngredient[ingredientIDs.Length];
        for (int i = 0; i < ingredientIDs.Length; i++)
        {
            recipe.ingredients[i] = new Emberroot.CraftingIngredient
            {
                item = LoadItem(ingredientIDs[i]),
                amount = i < ingredientAmounts.Length ? ingredientAmounts[i] : 1
            };
        }

        AssetDatabase.CreateAsset(recipe, $"Assets/Resources/Data/Recipes/{id}.asset");
    }

    static Emberroot.ItemData LoadItem(string id)
    {
        var items = Resources.LoadAll<Emberroot.ItemData>("Data/Items");
        foreach (var item in items)
            if (item != null && item.itemID == id) return item;
        return null;
    }

    static void EnsureFolder(string path)
    {
        if (AssetDatabase.IsValidFolder(path)) return;
        string[] parts = path.Split('/');
        string current = parts[0];
        for (int i = 1; i < parts.Length; i++)
        {
            string next = current + "/" + parts[i];
            if (!AssetDatabase.IsValidFolder(next))
                AssetDatabase.CreateFolder(current, parts[i]);
            current = next;
        }
    }
}
