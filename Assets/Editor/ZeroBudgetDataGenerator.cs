using UnityEngine;
using UnityEditor;
using System.Collections.Generic;

namespace Emberroot.Editor
{
    public static class ZeroBudgetDataGenerator
    {
        [MenuItem("Emberroot/Generate/All Zero-Budget Data")]
        public static void GenerateAll()
        {
            GenerateDungeonData();
            GenerateCompanionData();
            GenerateFishData();
            GenerateBaitData();
            GenerateFurnitureData();
            GenerateChallengeTemplates();
            GenerateAchievementDefinitions();
            GenerateRoomTemplates();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[Emberroot] All zero-budget data generated!");
        }

        [MenuItem("Emberroot/Generate/Dungeon Data")]
        public static void GenerateDungeonData()
        {
            string[] themes = { "Forest", "Mines", "Swamp", "Peak", "Caves", "Crater", "Marsh", "Skylands",
                "SunkenCity", "Frosthollow", "NightmareDepths", "AbyssalRift", "Convergence" };
            string[] names = { "Whispering Woods", "Crystal Depths", "Rotting Fen", "Storm Peaks", "Dark Hollow",
                "Molten Core", "Mist Bog", "Cloud Ruins", "Drowned City", "Frozen Halls",
                "Nightmare Gate", "Void Tear", "Elemental Convergence" };

            EnsureFolder("Assets/Data/Dungeons");
            for (int i = 0; i < themes.Length; i++)
            {
                var data = ScriptableObject.CreateInstance<Dungeon.DungeonData>();
                data.dungeonName = names[i];
                data.theme = (Dungeon.DungeonTheme)i;
                data.minRooms = 8 + i;
                data.maxRooms = 12 + i;
                data.minFloorCount = 3 + i / 3;
                data.maxFloorCount = 5 + i / 2;
                data.levelRangeMin = i * 3 + 1;
                data.levelRangeMax = i * 3 + 10;
                data.lootQualityMultiplier = 1f + i * 0.1f;
                AssetDatabase.CreateAsset(data, $"Assets/Data/Dungeons/{names[i].Replace(" ", "_")}.asset");
            }
        }

        [MenuItem("Emberroot/Generate/Companion Data")]
        public static void GenerateCompanionData()
        {
            string[] names = { "Forest Spirit", "Shadow Wolf", "Crystal Golem", "Ember Sprite",
                "Frost Fairy", "Lightning Bug", "Void Wisp", "Stone Guardian" };
            int[] hps = { 50, 70, 120, 40, 45, 35, 60, 150 };
            int[] damages = { 5, 8, 3, 10, 4, 12, 6, 2 };
            string[] elements = { "Neutral", "Dark", "Earth", "Fire", "Ice", "Lightning", "Void", "Earth" };

            EnsureFolder("Assets/Data/Companions");
            for (int i = 0; i < names.Length; i++)
            {
                var data = ScriptableObject.CreateInstance.Companion.CompanionData>();
                data.companionName = names[i];
                data.description = $"A loyal {names[i].ToLower()} companion";
                data.baseHP = hps[i];
                data.baseDamage = damages[i];
                data.affinityElement = (Companion.Element)System.Enum.Parse(typeof(Companion.Element), elements[i]);
                data.personality = i % 4 == 0 ? Companion.CompanionPersonality.Aggressive :
                    i % 4 == 1 ? Companion.CompanionPersonality.Defensive :
                    i % 4 == 2 ? Companion.CompanionPersonality.Balanced :
                    Companion.CompanionPersonality.Supportive;
                AssetDatabase.CreateAsset(data, $"Assets/Data/Companions/{names[i].Replace(" ", "_")}.asset");
            }
        }

        [MenuItem("Emberroot/Generate/Fish & Bait Data")]
        public static void GenerateFishData()
        {
            string[] fishNames = { "River Trout", "Golden Carp", "Shadow Eel", "Crystal Pike",
                "Void Leviathan", "Ember Salmon", "Frost Cod", "Storm Marlin",
                "Ancient Turtle", "Mythic Hydra" };
            float[] difficulties = { 0.2f, 0.3f, 0.5f, 0.4f, 0.8f, 0.35f, 0.45f, 0.6f, 0.7f, 0.95f };
            int[] values = { 10, 25, 50, 40, 200, 30, 35, 75, 150, 500 };
            string[] rarities = { "Common", "Common", "Uncommon", "Rare", "Epic", "Uncommon",
                "Rare", "Rare", "Legendary", "Mythic" };
            string[] zones = { "River", "River", "Swamp", "Lake", "DeepSea", "River",
                "Frosthollow", "Ocean", "Underground", "AbyssalRift" };

            EnsureFolder("Assets/Data/Fishing");
            for (int i = 0; i < fishNames.Length; i++)
            {
                var data = ScriptableObject.CreateInstance<Fishing.FishData>();
                data.fishName = fishNames[i];
                data.catchDifficulty = difficulties[i];
                data.baseValue = values[i];
                data.rarity = (Fishing.Rarity)System.Enum.Parse(typeof(Fishing.Rarity), rarities[i]);
                data.minWeight = 0.5f + i * 0.3f;
                data.maxWeight = data.minWeight + 1f + i * 0.5f;
                AssetDatabase.CreateAsset(data, $"Assets/Data/Fishing/{fishNames[i].Replace(" ", "_")}.asset");
            }

            // Bait
            string[] baitNames = { "Worm", "Insect", "Lure", "Golden Bait", "Magic Bait" };
            float[] rareBonuses = { 0, 0, 0.05f, 0.15f, 0.3f };
            float[] attractBonuses = { 0, 0.1f, 0.2f, 0.3f, 0.5f };

            for (int i = 0; i < baitNames.Length; i++)
            {
                var data = ScriptableObject.CreateInstance<Fishing.BaitData>();
                data.baitName = baitNames[i];
                data.baitType = (Fishing.BaitType)i;
                data.rareBonus = rareBonuses[i];
                data.attractBonus = attractBonuses[i];
                data.stackSize = 20 - i * 2;
                data.craftCost = 5 + i * 10;
                AssetDatabase.CreateAsset(data, $"Assets/Data/Fishing/Bait_{baitNames[i].Replace(" ", "_")}.asset");
            }
        }

        [MenuItem("Emberroot/Generate/Furniture Data")]
        public static void GenerateFurnitureData()
        {
            string[] names = { "Wooden Chair", "Oak Table", "Stone Fireplace", "Iron Chandelier",
                "Wool Rug", "Treasure Chest", "Weapon Rack", "Alchemy Table",
                "Garden Planter", "Bookshelf", "Grandfather Clock", "Stained Glass Window",
                "Trophy Mount", "Gem Display", "Throne", "Enchanted Mirror" };
            float[] comfort = { 2, 3, 5, 4, 3, 1, 2, 4, 6, 3, 4, 5, 8, 6, 10, 7 };
            int[] costs = { 10, 25, 50, 75, 20, 100, 60, 80, 40, 35, 45, 90, 200, 150, 500, 300 };
            string[] categories = { "Functional", "Functional", "Lighting", "Lighting", "Decoration",
                "Storage", "Functional", "Crafting", "Garden", "Decoration",
                "Decoration", "Decoration", "Trophy", "Trophy", "Comfort", "Decoration" };

            EnsureFolder("Assets/Data/Housing");
            for (int i = 0; i < names.Length; i++)
            {
                var data = ScriptableObject.CreateInstance<Housing.FurnitureData>();
                data.furnitureName = names[i];
                data.comfortBonus = comfort[i];
                data.goldCost = costs[i];
                data.category = (Housing.FurnitureCategory)System.Enum.Parse(typeof(Housing.FurnitureCategory), categories[i]);
                data.rarity = (Housing.FurnitureRarity)Mathf.Min(4, i / 3);
                AssetDatabase.CreateAsset(data, $"Assets/Data/Housing/{names[i].Replace(" ", "_")}.asset");
            }
        }

        [MenuItem("Emberroot/Generate/Challenge Templates")]
        public static void GenerateChallengeTemplates()
        {
            string[] names = { "Monster Hunter", "Boss Slayer", "Gold Hoarder", "Master Crafter",
                "Dungeon Delver", "Ability Master", "Angler", "Deep Diver",
                "Survivor", "Combo King" };
            string[] types = { "KillEnemies", "KillBosses", "CollectGold", "CraftItems",
                "CompleteDungeons", "UseAbilities", "FishCatch", "ReachFloor",
                "NearMiss", "StreakWin" };
            int[] minTargets = { 10, 1, 100, 3, 1, 20, 5, 3, 3, 3 };
            int[] maxTargets = { 50, 5, 500, 10, 5, 100, 20, 10, 10, 10 };
            int[] rewards = { 30, 100, 50, 40, 80, 25, 35, 60, 45, 70 };

            EnsureFolder("Assets/Data/Challenges");
            for (int i = 0; i < names.Length; i++)
            {
                var data = ScriptableObject.CreateInstance<Challenges.ChallengeTemplate>();
                data.challengeName = names[i];
                data.challengeType = (Challenges.ChallengeType)System.Enum.Parse(typeof(Challenges.ChallengeType), types[i]);
                data.minTarget = minTargets[i];
                data.maxTarget = maxTargets[i];
                data.baseReward = rewards[i];
                AssetDatabase.CreateAsset(data, $"Assets/Data/Challenges/{names[i].Replace(" ", "_")}.asset");
            }
        }

        [MenuItem("Emberroot/Generate/Achievement Definitions")]
        public static void GenerateAchievementDefinitions()
        {
            var defs = new (string id, string name, string desc, string type, int target, string category, int gold)[]
            {
                ("first_kill", "First Blood", "Defeat your first enemy", "KillEnemies", 1, "Combat", 50),
                ("kill_100", "Monster Slayer", "Defeat 100 enemies", "KillEnemies", 100, "Combat", 200),
                ("kill_1000", "War Machine", "Defeat 1000 enemies", "KillEnemies", 1000, "Combat", 500),
                ("first_boss", "Boss Hunter", "Defeat your first boss", "KillBosses", 1, "Combat", 100),
                ("kill_10_bosses", "Boss Slayer", "Defeat 10 bosses", "KillBosses", 10, "Combat", 500),
                ("gold_100", "Penny Pincher", "Collect 100 gold", "CollectGold", 100, "Collection", 25),
                ("gold_1000", "Rich", "Collect 1000 gold", "CollectGold", 1000, "Collection", 100),
                ("gold_10000", "Tycoon", "Collect 10000 gold", "CollectGold", 10000, "Collection", 500),
                ("craft_10", "Apprentice", "Craft 10 items", "CraftItems", 10, "Crafting", 50),
                ("craft_100", "Master Crafter", "Craft 100 items", "CraftItems", 100, "Crafting", 300),
                ("dungeon_1", "Explorer", "Complete your first dungeon", "CompleteDungeons", 1, "Exploration", 75),
                ("dungeon_10", "Delver", "Complete 10 dungeons", "CompleteDungeons", 10, "Exploration", 400),
                ("level_10", "Rising Star", "Reach level 10", "ReachLevel", 10, "Mastery", 100),
                ("level_50", "Veteran", "Reach level 50", "ReachLevel", 50, "Mastery", 500),
                ("level_100", "Legendary", "Reach level 100", "ReachLevel", 100, "Mastery", 1000),
                ("secret_1", "Curious", "Find a secret room", "FindSecretRoom", 1, "Exploration", 50),
                ("secret_10", "Treasure Hunter", "Find 10 secret rooms", "FindSecretRoom", 10, "Exploration", 300),
                ("fish_1", "Angler", "Catch your first fish", "CatchFish", 1, "Collection", 25),
                ("fish_50", "Master Angler", "Catch 50 fish", "CatchFish", 50, "Collection", 200),
                ("fish_100", "Sea Legend", "Catch 100 fish", "CatchFish", 100, "Collection", 500),
                ("house_1", "Homeowner", "Build your first room", "BuildHousing", 1, "Collection", 100),
                ("arena_1", "Arena Fighter", "Complete your first arena run", "WinArena", 1, "Combat", 100),
                ("arena_10", "Arena Champion", "Complete 10 arena runs", "WinArena", 10, "Combat", 500),
                ("challenge_1", "Challenger", "Complete your first challenge", "CompleteChallenge", 1, "Mastery", 50),
                ("challenge_50", "Challenge Master", "Complete 50 challenges", "CompleteChallenge", 50, "Mastery", 500),
                ("trade_10", "Merchant", "Complete 10 trades", "TradeItems", 10, "Social", 30),
                ("trade_100", "Trade Baron", "Complete 100 trades", "TradeItems", 100, "Social", 300),
                ("quest_10", "Adventurer", "Complete 10 quests", "CompleteQuests", 10, "Exploration", 100),
                ("quest_50", "Hero", "Complete 50 quests", "CompleteQuests", 50, "Exploration", 500),
                ("perfect_parry_10", "Parry Master", "Perform 10 perfect parries", "PerfectParry", 10, "Combat", 200),
                ("synergy_5", "Elementalist", "Discover 5 elemental synergies", "DiscoverSynergy", 5, "Mastery", 150),
                ("bestiary_20", "Naturalist", "Discover 20 creatures in bestiary", "CollectBestiary", 20, "Collection", 200),
                ("companion_max", "Best Friend", "Max loyalty with a companion", "MaxLoyalty", 1, "Social", 300),
                ("floor_50", "Deep Diver", "Reach floor 50 in roguelite mode", "ReachFloor", 50, "Mastery", 400),
                ("streak_10", "Hot Streak", "Win 10 streak games", "StreakWins", 10, "Mastery", 250),
                ("near_miss_5", "Lucky", "Achieve 5 near-misses", "NearMiss", 5, "Combat", 75),
                ("ability_500", "Skillful", "Use abilities 500 times", "UseAbilities", 500, "Mastery", 200),
                ("recipe_20", "Recipe Collector", "Discover 20 recipes", "DiscoverRecipe", 20, "Crafting", 200),
                ("crafting_100", "Grandmaster", "Reach crafting skill 100", "MaxCraftingSkill", 1, "Crafting", 1000),
                ("no_damage_boss", "Untouchable", "Defeat a boss without taking damage", "DefeatWithoutDamage", 1, "Hidden", 500),
                ("secret_boss", "Shadow Hunter", "Find and defeat a secret boss", "KillBosses", 1, "Hidden", 1000),
                ("playtime_24h", "No Life", "Play for 24 hours", "PlayTime", 1440, "Hidden", 100),
                ("collect_all_fish", "Encyclopedia", "Catch every fish species", "CatchFish", 10, "Hidden", 1000),
                ("max_level_ng", "Ascended", "Reach max level in NG+", "ReachLevel", 1, "Hidden", 2000),
            };

            EnsureFolder("Assets/Data/Achievements");
            foreach (var (id, name, desc, type, target, category, gold) in defs)
            {
                var data = ScriptableObject.CreateInstance<Achievements.AchievementDefinition>();
                data.id = id;
                data.achievementName = name;
                data.description = desc;
                data.achievementType = (Achievements.AchievementType)System.Enum.Parse(typeof(Achievements.AchievementType), type);
                data.targetCount = target;
                data.category = (Achievements.AchievementCategory)System.Enum.Parse(typeof(Achievements.AchievementCategory), category);
                data.goldReward = gold;
                AssetDatabase.CreateAsset(data, $"Assets/Data/Achievements/{id.Replace(" ", "_")}.asset");
            }
        }

        [MenuItem("Emberroot/Generate/Room Templates")]
        public static void GenerateRoomTemplates()
        {
            string[] roomNames = { "Combat Hall", "Trap Corridor", "Treasure Vault", "Boss Arena",
                "Rest Chamber", "Merchant Shop", "Puzzle Room", "Elite Chamber" };
            string[] types = { "Combat", "Trap", "Treasure", "Boss", "Rest", "Shop", "Puzzle", "Elite" };
            int[] maxEnemies = { 4, 2, 0, 1, 0, 0, 0, 3 };
            int[] maxChests = { 1, 0, 3, 1, 0, 0, 0, 1 };

            EnsureFolder("Assets/Data/Rooms");
            for (int i = 0; i < roomNames.Length; i++)
            {
                var data = ScriptableObject.CreateInstance<Dungeon.RoomTemplate>();
                data.roomName = roomNames[i];
                data.roomType = (Dungeon.RoomType)System.Enum.Parse(typeof(Dungeon.RoomType), types[i]);
                data.maxEnemies = maxEnemies[i];
                data.maxChests = maxChests[i];
                data.minDoors = 2;
                data.maxDoors = 4;
                data.roomSize = new Vector2(16, 12);
                AssetDatabase.CreateAsset(data, $"Assets/Data/Rooms/{roomNames[i].Replace(" ", "_")}.asset");
            }
        }

        static void EnsureFolder(string path)
        {
            if (!AssetDatabase.IsValidFolder(path))
            {
                string parent = System.IO.Path.GetDirectoryName(path).Replace("\\", "/");
                string folder = System.IO.Path.GetFileName(path);
                if (!AssetDatabase.IsValidFolder(parent)) EnsureFolder(parent);
                AssetDatabase.CreateFolder(parent, folder);
            }
        }
    }
}
