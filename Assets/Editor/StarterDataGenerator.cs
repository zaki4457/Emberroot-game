using UnityEngine;
using UnityEditor;

/// <summary>
/// Generates all starter content data assets for Emberroot.
/// Run via menu: Emberroot > Generate Starter Data
/// Creates items, enemies, NPCs, quests, regions, and starter player stats.
/// </summary>
public static class StarterDataGenerator
{
    [MenuItem("Emberroot/Generate Starter Data")]
    public static void GenerateAll()
    {
        CreatePlayerStats();
        CreateItems();
        CreateEnemies();
        CreateNPCs();
        CreateQuests();
        CreateRegions();
        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();
        Debug.Log("[StarterDataGenerator] All starter data generated!");
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

    // === PLAYER STATS ===

    static void CreatePlayerStats()
    {
        EnsureFolder("Assets/Resources/Data");

        var stats = ScriptableObject.CreateInstance<Emberroot.PlayerStatsData>();
        stats.maxHealth = 100;
        stats.healthRegenRate = 2;
        stats.healthRegenDelay = 5f;
        stats.maxStamina = 100;
        stats.staminaRegenRate = 25;
        stats.staminaRegenDelay = 0.5f;
        stats.power = 10;
        stats.meleeDamageMultiplier = 1.0f;
        stats.rangedDamageMultiplier = 0.8f;
        stats.attackSpeed = 1.0f;
        stats.rangedCooldown = 0.5f;
        stats.moveSpeed = 5.0f;
        stats.dodgeSpeed = 10.0f;
        stats.dodgeDuration = 0.3f;
        stats.dodgeCooldown = 0.8f;
        stats.currentLevel = 1;
        stats.startingGold = 50;
        stats.hpPerLevel = 10;
        stats.staminaPerLevel = 5;
        stats.powerPerLevel = 2;

        AssetDatabase.CreateAsset(stats, "Assets/Resources/Data/PlayerStats_Default.asset");
        Debug.Log("[StarterDataGenerator] Player stats created");
    }

    // === ITEMS ===

    static void CreateItems()
    {
        EnsureFolder("Assets/Resources/Data/Items");

        // --- Tier 1: Forest (Levels 1-4) ---
        CreateItem("item_wooden_sword", "Wooden Sword", "A simple wooden training sword.",
            Emberroot.ItemType.Weapon, baseDamage: 5, sellPrice: 10, buyPrice: 25);
        CreateItem("item_iron_sword", "Iron Sword", "A sturdy iron blade.",
            Emberroot.ItemType.Weapon, baseDamage: 10, sellPrice: 30, buyPrice: 75);
        CreateItem("item_leather_armor", "Leather Armor", "Basic protection.",
            Emberroot.ItemType.Armor, healAmount: 5, sellPrice: 15, buyPrice: 40);

        // --- Tier 2: Mines (Levels 3-5) ---
        CreateItem("item_flame_blade", "Flame Blade", "A blade wreathed in embers. Burns on hit.",
            Emberroot.ItemType.Weapon, baseDamage: 15, sellPrice: 80, buyPrice: 200);
        CreateItem("item_crystal_bow", "Crystal Bow", "A bow carved from living crystal.",
            Emberroot.ItemType.Weapon, baseDamage: 12, sellPrice: 60, buyPrice: 150);
        CreateItem("item_chainmail", "Chainmail", "Interlocking metal rings.",
            Emberroot.ItemType.Armor, healAmount: 12, sellPrice: 50, buyPrice: 125);

        // --- Tier 3: Peak (Levels 5-7) ---
        CreateItem("item_obsidian_axe", "Obsidian Axe", "Forged from volcanic glass. Devastating.",
            Emberroot.ItemType.Weapon, baseDamage: 20, sellPrice: 120, buyPrice: 300);
        CreateItem("item_crystal_plate", "Crystal Plate", "Crystal-infused armor. Resists magic.",
            Emberroot.ItemType.Armor, healAmount: 20, sellPrice: 100, buyPrice: 250);
        CreateItem("item_ring_of_strength", "Ring of Strength", "Increases attack power.",
            Emberroot.ItemType.Accessory, baseDamage: 5, sellPrice: 40, buyPrice: 100);

        // --- Tier 4: Swamp (Levels 4-6) ---
        CreateItem("item_venom_fang", "Venom Fang Dagger", "A dagger coated in swamp venom. Poisons on hit.",
            Emberroot.ItemType.Weapon, baseDamage: 18, sellPrice: 90, buyPrice: 225);
        CreateItem("item_bogweave_robe", "Bogweave Robe", "Woven from marsh reeds. Light but protective.",
            Emberroot.ItemType.Armor, healAmount: 15, sellPrice: 70, buyPrice: 175);
        CreateItem("item_swamp_amulet", "Swamp Amulet", "Grants resistance to poison.",
            Emberroot.ItemType.Accessory, healAmount: 8, sellPrice: 55, buyPrice: 140);

        // --- Tier 5: Skylands (Levels 7-9) ---
        CreateItem("item_storm_blade", "Storm Blade", "Crackles with lightning. chance to shock.",
            Emberroot.ItemType.Weapon, baseDamage: 28, sellPrice: 180, buyPrice: 450);
        CreateItem("item_skyward_bow", "Skyward Bow", "Arrows fly with wind magic.",
            Emberroot.ItemType.Weapon, baseDamage: 22, sellPrice: 150, buyPrice: 375);
        CreateItem("item_aether_plate", "Aether Plate", "Forged from sky metal. Featherweight protection.",
            Emberroot.ItemType.Armor, healAmount: 28, sellPrice: 160, buyPrice: 400);
        CreateItem("item_wind_boots", "Windwalkers", "Boots imbued with wind. Increases dodge speed.",
            Emberroot.ItemType.Accessory, baseDamage: 3, sellPrice: 120, buyPrice: 300);

        // --- Tier 6: Shadow Realm (Levels 9-12) ---
        CreateItem("item_void_reaper", "Void Reaper", "A scythe that drains life force.",
            Emberroot.ItemType.Weapon, baseDamage: 35, sellPrice: 250, buyPrice: 600);
        CreateItem("item_shadow_cloak", "Shadow Cloak", "Woven from darkness. Grants brief invisibility on dodge.",
            Emberroot.ItemType.Armor, healAmount: 35, sellPrice: 220, buyPrice: 550);
        CreateItem("itemVoid_amulet", "Void Amulet", "Channels void energy. Increases all damage.",
            Emberroot.ItemType.Accessory, baseDamage: 10, sellPrice: 200, buyPrice: 500);
        CreateItem("item_void_blade", "Void Blade", "The ultimate weapon. Cuts through reality itself.",
            Emberroot.ItemType.Weapon, baseDamage: 45, sellPrice: 400, buyPrice: 1000);

        // --- Consumables ---
        CreateItem("item_health_potion", "Health Potion", "Restores 30 HP.",
            Emberroot.ItemType.Consumable, healAmount: 30, maxStack: 10, sellPrice: 5, buyPrice: 15);
        CreateItem("item_greater_health_potion", "Greater Health Potion", "Restores 75 HP.",
            Emberroot.ItemType.Consumable, healAmount: 75, maxStack: 5, sellPrice: 20, buyPrice: 50);
        CreateItem("item_elixir_of_life", "Elixir of Life", "Fully restores HP.",
            Emberroot.ItemType.Consumable, healAmount: 999, maxStack: 3, sellPrice: 80, buyPrice: 200);
        CreateItem("item_stamina_elixir", "Stamina Elixir", "Restores stamina instantly.",
            Emberroot.ItemType.Consumable, staminaRestoreAmount: 50, maxStack: 5, sellPrice: 10, buyPrice: 25);
        CreateItem("item_antidote", "Antidote", "Cures poison.",
            Emberroot.ItemType.Consumable, maxStack: 5, sellPrice: 5, buyPrice: 15);
        CreateItem("item_frost_remedy", "Frost Remedy", "Cures freeze and slow effects.",
            Emberroot.ItemType.Consumable, maxStack: 5, sellPrice: 8, buyPrice: 20);
        CreateItem("item_curse_scroll", "Scroll of Purification", "Removes curse effects.",
            Emberroot.ItemType.Consumable, maxStack: 3, sellPrice: 25, buyPrice: 60);

        // --- Key Items ---
        CreateItem("item_crystal_key", "Crystal Key", "Opens the sealed mine entrance.",
            Emberroot.ItemType.KeyItem, isKeyItem: true, unlocksRegion: Emberroot.RegionID.Mines);
        CreateItem("item_ember_stone", "Ember Stone", "A stone that glows with inner fire. Required to reach the peak.",
            Emberroot.ItemType.KeyItem, isKeyItem: true, unlocksRegion: Emberroot.RegionID.Peak);
        CreateItem("item_swamp_compass", "Swamp Compass", "Navigates the treacherous marshes.",
            Emberroot.ItemType.KeyItem, isKeyItem: true, unlocksRegion: Emberroot.RegionID.Swamp);
        CreateItem("item_sky_passage", "Sky Passage Stone", "Opens the path to the floating islands.",
            Emberroot.ItemType.KeyItem, isKeyItem: true, unlocksRegion: Emberroot.RegionID.Skylands);
        CreateItem("item_shadow_key", "Shadow Key", "Unlocks the gate to the Shadow Realm.",
            Emberroot.ItemType.KeyItem, isKeyItem: true, unlocksRegion: Emberroot.RegionID.ShadowRealm);
        CreateItem("item_forest_map", "Forest Map", "Reveals the layout of the Whispering Woods.",
            Emberroot.ItemType.KeyItem, isKeyItem: true);

        Debug.Log("[StarterDataGenerator] Items created (35 items)");
    }

    static void CreateItem(string id, string name, string desc, Emberroot.ItemType type,
        int baseDamage = 0, int healAmount = 0, int staminaRestoreAmount = 0,
        int maxStack = 1, int sellPrice = 0, int buyPrice = 0,
        bool isKeyItem = false, Emberroot.RegionID unlocksRegion = default)
    {
        var item = ScriptableObject.CreateInstance<Emberroot.ItemData>();
        item.itemID = id;
        item.displayName = name;
        item.description = desc;
        item.itemType = type;
        item.baseDamage = baseDamage;
        item.healAmount = healAmount;
        item.staminaRestoreAmount = staminaRestoreAmount;
        item.maxStack = maxStack;
        item.sellPrice = sellPrice;
        item.buyPrice = buyPrice;
        item.isKeyItem = isKeyItem;
        item.unlocksRegionID = unlocksRegion;

        if (type == Emberroot.ItemType.Weapon) item.equipSlot = Emberroot.EquipSlot.Weapon;
        else if (type == Emberroot.ItemType.Armor) item.equipSlot = Emberroot.EquipSlot.Armor;
        else if (type == Emberroot.ItemType.Accessory) item.equipSlot = Emberroot.EquipSlot.Accessory;

        AssetDatabase.CreateAsset(item, $"Assets/Resources/Data/Items/{id}.asset");
    }

    // === ENEMIES ===

    static void CreateEnemies()
    {
        EnsureFolder("Assets/Resources/Data/Enemies");

        // --- Whispering Woods (Forest) - Levels 1-4 ---
        CreateEnemy("enemy_goblin", "Goblin", 20, 5, 2.0f, 1.0f, 5f,
            Emberroot.EnemyBehavior.Melee, 10, 3, 8, Emberroot.RegionID.Forest);
        CreateEnemy("enemy_wolf", "Shadow Wolf", 25, 7, 3.5f, 1.2f, 7f,
            Emberroot.EnemyBehavior.Melee, 15, 5, 10, Emberroot.RegionID.Forest);
        CreateEnemy("enemy_spider", "Web Spinner", 15, 4, 1.5f, 6f, 8f,
            Emberroot.EnemyBehavior.Ranged, 8, 2, 6, Emberroot.RegionID.Forest);
        CreateEnemy("enemy_forest_spirit", "Forest Spirit", 40, 8, 2.0f, 1.5f, 8f,
            Emberroot.EnemyBehavior.Hybrid, 20, 8, 15, Emberroot.RegionID.Forest);

        // --- Crystal Mines - Levels 3-5 ---
        CreateEnemy("enemy_crystal_golem", "Crystal Golem", 50, 10, 1.5f, 1.8f, 6f,
            Emberroot.EnemyBehavior.Melee, 25, 10, 20, Emberroot.RegionID.Mines);
        CreateEnemy("enemy_minecrawler", "Minecrawler", 30, 6, 3.0f, 1.0f, 6f,
            Emberroot.EnemyBehavior.Melee, 15, 5, 12, Emberroot.RegionID.Mines);
        CreateEnemy("enemy_crystal_shard", "Crystal Shard", 20, 8, 0f, 8f, 10f,
            Emberroot.EnemyBehavior.Ranged, 12, 4, 10, Emberroot.RegionID.Mines);

        // --- Ashen Peak - Levels 5-7 ---
        CreateEnemy("enemy_fire_elemental", "Fire Elemental", 60, 12, 2.5f, 1.5f, 8f,
            Emberroot.EnemyBehavior.Hybrid, 30, 15, 25, Emberroot.RegionID.Peak);
        CreateEnemy("enemy_ember_wraith", "Ember Wraith", 45, 10, 3.0f, 2.0f, 10f,
            Emberroot.EnemyBehavior.Melee, 25, 12, 22, Emberroot.RegionID.Peak);
        CreateEnemy("enemy_magma_beast", "Magma Beast", 80, 15, 1.8f, 2.5f, 7f,
            Emberroot.EnemyBehavior.Melee, 40, 20, 35, Emberroot.RegionID.Peak);

        // --- Fetid Marsh (Swamp) - Levels 4-6 ---
        CreateEnemy("enemy_bog_lurker", "Bog Lurker", 55, 11, 2.2f, 1.5f, 7f,
            Emberroot.EnemyBehavior.Melee, 28, 12, 22, Emberroot.RegionID.Swamp);
        CreateEnemy("enemy_swamp_witch", "Swamp Witch", 40, 14, 1.8f, 8f, 10f,
            Emberroot.EnemyBehavior.Ranged, 30, 15, 28, Emberroot.RegionID.Swamp);
        CreateEnemy("enemy_mosquito_swarm", "Mosquito Swarm", 25, 6, 4.0f, 1.0f, 8f,
            Emberroot.EnemyBehavior.Melee, 12, 4, 10, Emberroot.RegionID.Swamp);
        CreateEnemy("enemy_tentacle_vine", "Tentacle Vine", 70, 9, 0f, 3f, 6f,
            Emberroot.EnemyBehavior.Ranged, 22, 8, 18, Emberroot.RegionID.Swamp);

        // --- Skylands - Levels 7-9 ---
        CreateEnemy("enemy_storm_harpy", "Storm Harpy", 50, 13, 3.5f, 1.5f, 9f,
            Emberroot.EnemyBehavior.Hybrid, 35, 18, 30, Emberroot.RegionID.Skylands);
        CreateEnemy("enemy_cloud_sentinel", "Cloud Sentinel", 85, 16, 1.5f, 2.0f, 7f,
            Emberroot.EnemyBehavior.Melee, 45, 22, 38, Emberroot.RegionID.Skylands);
        CreateEnemy("enemy_wind_sprite", "Wind Sprite", 35, 10, 4.5f, 7f, 10f,
            Emberroot.EnemyBehavior.Ranged, 20, 10, 20, Emberroot.RegionID.Skylands);
        CreateEnemy("enemy_thunder_golem", "Thunder Golem", 100, 18, 1.2f, 2.5f, 8f,
            Emberroot.EnemyBehavior.Melee, 55, 28, 45, Emberroot.RegionID.Skylands);

        // --- Shadow Realm - Levels 9-12 ---
        CreateEnemy("enemy_shadow_stalker", "Shadow Stalker", 65, 15, 3.5f, 1.5f, 10f,
            Emberroot.EnemyBehavior.Melee, 40, 20, 35, Emberroot.RegionID.ShadowRealm);
        CreateEnemy("enemy_void_wraith", "Void Wraith", 55, 20, 2.5f, 8f, 12f,
            Emberroot.EnemyBehavior.Ranged, 45, 25, 40, Emberroot.RegionID.ShadowRealm);
        CreateEnemy("enemy_nightmare", "Nightmare", 90, 22, 2.0f, 2.0f, 10f,
            Emberroot.EnemyBehavior.Hybrid, 60, 30, 50, Emberroot.RegionID.ShadowRealm);
        CreateEnemy("enemy_soul_collector", "Soul Collector", 120, 25, 1.5f, 3f, 9f,
            Emberroot.EnemyBehavior.Melee, 75, 40, 65, Emberroot.RegionID.ShadowRealm);

        Debug.Log("[StarterDataGenerator] Enemies created (24 enemies)");
    }

    static void CreateEnemy(string id, string name, int hp, int damage, float speed, float range, float detection,
        Emberroot.EnemyBehavior behavior, int xp, int goldMin, int goldMax, Emberroot.RegionID region)
    {
        var enemy = ScriptableObject.CreateInstance<Emberroot.EnemyData>();
        enemy.enemyID = id;
        enemy.displayName = name;
        enemy.maxHealth = hp;
        enemy.attackDamage = damage;
        enemy.moveSpeed = speed;
        enemy.attackRange = range;
        enemy.detectionRange = detection;
        enemy.behaviorType = behavior;
        enemy.xpReward = xp;
        enemy.goldDropMin = goldMin;
        enemy.goldDropMax = goldMax;
        enemy.regionID = region;
        enemy.patrolSpeed = speed * 0.7f;
        enemy.patrolWaitTime = 2f;
        enemy.telegraphDuration = 0.4f;
        enemy.attackCooldown = 1.5f;
        enemy.hurtDuration = 0.3f;

        AssetDatabase.CreateAsset(enemy, $"Assets/Resources/Data/Enemies/{id}.asset");
    }

    // === NPCs ===

    static void CreateNPCs()
    {
        EnsureFolder("Assets/Resources/Data/NPCs");

        // --- Hub Village ---
        CreateNPC("npc_elder", "Village Elder", "The wise leader of the village.");
        CreateNPC("npc_blacksmith", "Blacksmith", "Forge weapons and armor.");
        CreateNPC("npc_merchant", "Merchant", "Buy and sell supplies.");
        CreateNPC("npc_healer", "Healer", "Restores health and cures ailments.");
        CreateNPC("npc_scout", "Scout", "Knows the paths between regions.");
        CreateNPC("npc_child", "Curious Child", "Heard rumors about the dungeon.");
        CreateNPC("npc_chef", "Village Chef", "Cook powerful food buffs.");
        CreateNPC("npc_enchanter", "Enchanter", "Infuse weapons with elemental power.");

        // --- Forest ---
        CreateNPC("npc_forest_sage", "Forest Sage", "A hermit who knows the forest's secrets.");
        CreateNPC("npc_trapper", "Trapper", "Specializes in beast hunting.");

        // --- Mines ---
        CreateNPC("npc_miner_foreman", "Mine Foreman", "Oversees the crystal mining operation.");
        CreateNPC("npc_geologist", "Geologist", "Studies crystal formations.");

        // --- Peak ---
        CreateNPC("npc_volcano_guardian", "Volcano Guardian", "Protects the mountain path.");
        CreateNPC("npc_fire_scholar", "Fire Scholar", "Studies volcanic energy.");

        // --- Swamp ---
        CreateNPC("npc_marsh_guide", "Marsh Guide", "Navigates the treacherous bogs.");
        CreateNPC("npc_herbalist", "Herbalist", "Gathers rare swamp herbs.");

        // --- Skylands ---
        CreateNPC("npc_wind_weaver", "Wind Weaver", "Controls the sky currents.");
        CreateNPC("npc_sky_smith", "Sky Smith", "Forges weapons from cloud metal.");

        // --- Shadow Realm ---
        CreateNPC("npc_void_scholar", "Void Scholar", "Studies the shadow dimension.");
        CreateNPC("npc_fallen_knight", "Fallen Knight", "Fights against the darkness.");

        Debug.Log("[StarterDataGenerator] NPCs created (20 NPCs)");
    }

    static void CreateNPC(string id, string name, string bio)
    {
        var npc = ScriptableObject.CreateInstance<Emberroot.NPCData>();
        npc.npcID = id;
        npc.displayName = name;
        npc.bio = bio;

        AssetDatabase.CreateAsset(npc, $"Assets/Resources/Data/NPCs/{id}.asset");
    }

    // === QUESTS ===

    static void CreateQuests()
    {
        EnsureFolder("Assets/Resources/Data/Quests");

        // --- Main Quests (7 total) ---
        CreateQuest("quest_main_01", "The Call to Adventure",
            "Investigate the disturbance in the Whispering Woods.",
            new string[] { "Reach the forest entrance", "Defeat 5 forest enemies", "Return to the Elder" },
            new int[] { 1, 5, 1 }, 100, 50);

        CreateQuest("quest_main_02", "Into the Mines",
            "Find the Crystal Key and explore the Crystal Mines.",
            new string[] { "Obtain the Crystal Key", "Clear the mine entrance", "Defeat the Overseer" },
            new int[] { 1, 1, 1 }, 200, 100);

        CreateQuest("quest_main_03", "Ascend the Peak",
            "Climb Ashen Peak and face the Ember Lord.",
            new string[] { "Obtain the Ember Stone", "Navigate the volcanic path", "Defeat the Ember Lord" },
            new int[] { 1, 1, 1 }, 500, 200);

        CreateQuest("quest_main_04", "Into the Bog",
            "Venture into the Fetid Marsh to find the Swamp Compass.",
            new string[] { "Obtain the Swamp Compass", "Navigate the marshes", "Defeat the Tidal Guardian" },
            new int[] { 1, 1, 1 }, 600, 300);

        CreateQuest("quest_main_05", "Skyward Journey",
            "Ascend to the Skylands and face the Storm Wyrm.",
            new string[] { "Obtain the Sky Passage Stone", "Climb the wind towers", "Defeat the Storm Wyrm" },
            new int[] { 1, 1, 1 }, 800, 400);

        CreateQuest("quest_main_06", "Descent into Shadow",
            "Enter the Shadow Realm and confront the Shadow King.",
            new string[] { "Obtain the Shadow Key", "Survive the shadow corridor", "Defeat the Shadow King" },
            new int[] { 1, 1, 1 }, 1000, 500);

        CreateQuest("quest_main_07", "The Final Confrontation",
            "Face the Void Lord and end the darkness forever.",
            new string[] { "Gather all 3 Void Shards", "Enter the Void Nexus", "Defeat the Void Lord" },
            new int[] { 3, 1, 1 }, 2000, 1000);

        // --- Side Quests (12 total) ---
        CreateQuest("quest_side_01", "Spider Infestation", 
            "Clear the spider nests from the forest caves.",
            new string[] { "Defeat 10 Web Spinners" },
            new int[] { 10 }, 50, 20);

        CreateQuest("quest_side_02", "Lost Miners",
            "Find the missing miners in the Crystal Mines.",
            new string[] { "Locate Miner A", "Locate Miner B", "Return to village" },
            new int[] { 1, 1, 1 }, 150, 50);

        CreateQuest("quest_side_03", "Herb Collection",
            "Gather healing herbs for the Healer.",
            new string[] { "Collect 5 Forest Herbs" },
            new int[] { 5 }, 30, 10);

        CreateQuest("quest_side_04", "Swamp Specimens",
            "Collect rare specimens from the Fetid Marsh for the Geologist.",
            new string[] { "Collect 3 Bog Samples", "Collect 2 Venom Sac", "Return to Geologist" },
            new int[] { 3, 2, 1 }, 200, 80);

        CreateQuest("quest_side_05", "Cloud Fishing",
            "Catch the legendary Sky Koi for the Village Chef.",
            new string[] { "Catch 3 Sky Koi" },
            new int[] { 3 }, 180, 70);

        CreateQuest("quest_side_06", "Shadow Artifacts",
            "Recover ancient artifacts from the Shadow Realm.",
            new string[] { "Find Shadow Relic A", "Find Shadow Relic B", "Find Shadow Relic C" },
            new int[] { 1, 1, 1 }, 350, 150);

        CreateQuest("quest_side_07", "Elemental Mastery",
            "Defeat enemies using each elemental status effect.",
            new string[] { "Burn 5 enemies", "Freeze 5 enemies", "Shock 5 enemies", "Curse 5 enemies" },
            new int[] { 5, 5, 5, 5 }, 400, 200);

        CreateQuest("quest_side_08", "Treasure Hunter",
            "Open 20 treasure chests across all regions.",
            new string[] { "Open 20 treasure chests" },
            new int[] { 20 }, 300, 150);

        CreateQuest("quest_side_09", "Monster Hunter",
            "Defeat 100 enemies total across all regions.",
            new string[] { "Defeat 100 enemies" },
            new int[] { 100 }, 500, 250);

        CreateQuest("quest_side_10", "Boss Rush",
            "Defeat all 7 bosses in a single playthrough.",
            new string[] { "Defeat Goblin Chieftain", "Defeat the Overseer", "Defeat the Ember Lord",
                           "Defeat Tidal Guardian", "Defeat Storm Wyrm", "Defeat Shadow King", "Defeat Void Lord" },
            new int[] { 1, 1, 1, 1, 1, 1, 1 }, 3000, 1500);

        CreateQuest("quest_side_11", "Fashion Souls",
            "Collect and equip 10 different armor pieces.",
            new string[] { "Collect 10 different armors" },
            new int[] { 10 }, 250, 100);

        CreateQuest("quest_side_12", "Completionist",
            "Discover all bestiary entries and complete all side quests.",
            new string[] { "Discover all enemies", "Complete all side quests" },
            new int[] { 24, 11 }, 5000, 2000);

        Debug.Log("[StarterDataGenerator] Quests created (19 quests)");
    }

    static void CreateQuest(string id, string name, string desc,
        string[] objectiveDescs, int[] objectiveTargets, int xpReward, int goldReward)
    {
        var quest = ScriptableObject.CreateInstance<Emberroot.QuestData>();
        quest.questID = id;
        quest.displayName = name;
        quest.description = desc;
        quest.xpReward = xpReward;
        quest.goldReward = goldReward;

        quest.objectives = new Emberroot.QuestObjective[objectiveDescs.Length];
        for (int i = 0; i < objectiveDescs.Length; i++)
        {
            quest.objectives[i] = new Emberroot.QuestObjective
            {
                objectiveID = $"{id}_obj_{i}",
                description = objectiveDescs[i],
                requiredCount = i < objectiveTargets.Length ? objectiveTargets[i] : 1
            };
        }

        AssetDatabase.CreateAsset(quest, $"Assets/Resources/Data/Quests/{id}.asset");
    }

    // === REGIONS ===

    static void CreateRegions()
    {
        EnsureFolder("Assets/Resources/Data/Regions");

        CreateRegion(Emberroot.RegionID.Hub, "Village Hub",
            "A peaceful village at the crossroads of the world.",
            true, 1, 12, "");

        CreateRegion(Emberroot.RegionID.Forest, "Whispering Woods",
            "Ancient trees whisper secrets. Goblins and wolves lurk in the shadows.",
            true, 1, 4, "");

        CreateRegion(Emberroot.RegionID.Mines, "Crystal Mines",
            "Glittering caverns filled with crystal formations and ancient guardians.",
            false, 3, 5, "item_crystal_key");

        CreateRegion(Emberroot.RegionID.Peak, "Ashen Peak",
            "A volcanic mountain where fire and fury reign.",
            false, 5, 7, "item_ember_stone");

        CreateRegion(Emberroot.RegionID.Swamp, "Fetid Marsh",
            "A treacherous bog filled with venomous creatures and toxic fog.",
            false, 4, 6, "item_swamp_compass");

        CreateRegion(Emberroot.RegionID.Skylands, "Skylands",
            "Floating islands above the clouds, home to storm creatures.",
            false, 7, 9, "item_sky_passage");

        CreateRegion(Emberroot.RegionID.ShadowRealm, "Shadow Realm",
            "A dark dimension where nightmares manifest. The final challenge.",
            false, 9, 12, "item_shadow_key");

        Debug.Log("[StarterDataGenerator] Regions created (7 regions)");
    }

    static void CreateRegion(Emberroot.RegionID regionEnum, string name, string desc,
        bool accessibleFromStart, int minLevel, int maxLevel, string requiredKeyID)
    {
        var region = ScriptableObject.CreateInstance<Emberroot.RegionData>();
        region.regionID = regionEnum;
        region.displayName = name;
        region.description = desc;
        region.isAccessibleFromStart = accessibleFromStart;
        region.requiredKeyItemID = requiredKeyID;

        AssetDatabase.CreateAsset(region, $"Assets/Resources/Data/Regions/{regionEnum}.asset");
    }
}
