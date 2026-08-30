using UnityEngine;
using UnityEditor;
using System.IO;

namespace Emberroot.Editor {
    public class RegionContentGenerator : EditorWindow {
        [MenuItem("Emberroot/Generate Region Content")]
        public static void ShowWindow() => GetWindow<RegionContentGenerator>("Region Content Generator");

        private void OnGUI() {
            GUILayout.Label("Generate ScriptableObject data for all regions", EditorStyles.boldLabel);
            GUILayout.Space(10);
            if (GUILayout.Button("Generate All Region Data", GUILayout.Height(40))) GenerateAll();
            GUILayout.Space(5);
            if (GUILayout.Button("Generate Enemies Only")) GenerateEnemies();
            if (GUILayout.Button("Generate Bosses Only")) GenerateBosses();
            if (GUILayout.Button("Generate Items Only")) GenerateItems();
            if (GUILayout.Button("Generate Quests Only")) GenerateQuests();
        }

        static void GenerateAll() { GenerateEnemies(); GenerateBosses(); GenerateItems(); GenerateQuests(); AssetDatabase.Refresh(); Debug.Log("All region data generated!"); }
        static string EnsureFolder(string p) { if (!Directory.Exists(p)) Directory.CreateDirectory(p); return p; }

        static void GenerateEnemies() {
            string dir = EnsureFolder("Assets/Data/Enemies/NewRegions");
            int count = 0;
            var R = new (RegionID id, (string n,int h,int d,int x,int g)[] e)[] {
                (RegionID.SunkenCity, new[]{("Abyssal Eel",45,12,20,8),("Coral Golem",80,15,30,12),("Depth Crawler",35,10,18,7),("Tide Priestess",60,18,35,15)}),
                (RegionID.Frosthollow, new[]{("Frost Wolf",50,14,22,9),("Ice Golem",90,16,32,13),("Blizzard Harpy",40,12,20,8),("Crystal Wraith",70,20,38,16)}),
                (RegionID.NightmareDepths, new[]{("Dream Stalker",55,16,25,10),("Nightmare Shade",65,18,28,11),("Phantom Knight",75,20,32,13),("Fear Wraith",50,22,30,12)}),
                (RegionID.AbyssalRift, new[]{("Void Spawn",60,18,28,11),("Rift Walker",70,20,32,13),("Entropy Bloom",45,15,24,9),("Null Guardian",85,22,36,15)}),
                (RegionID.Convergence, new[]{("Elemental Hybrid",75,22,35,14),("Prism Sentinel",90,25,40,17),("Convergence Core",100,28,45,19),("Chaos Wraith",80,24,38,16)})
            };
            foreach (var (rid, enemies) in R) {
                foreach (var (n,h,d,x,g) in enemies) {
                    string p = dir+"/"+n.Replace(" ","_")+".asset";
                    if (File.Exists(p)) continue;
                    var data = ScriptableObject.CreateInstance<EnemyData>();
                    data.displayName = n; data.maxHealth = h; data.attackDamage = d;
                    data.xpReward = x; data.goldDropMin = g/2; data.goldDropMax = g;
                    data.behaviorType = EnemyBehavior.Melee;
                    AssetDatabase.CreateAsset(data, p); count++;
                }
            }
            Debug.Log($"Generated {count} enemy assets");
        }

        static void GenerateBosses() {
            string dir = EnsureFolder("Assets/Data/Bosses/NewRegions");
            int count = 0;
            var B = new (string n, RegionID r, int h, int d, string desc)[] {
                ("Tidal Guardian", RegionID.SunkenCity, 500, 25, "Water serpent"),
                ("Storm Wyrm", RegionID.Frosthollow, 550, 28, "Ice dragon"),
                ("Dreamweaver", RegionID.NightmareDepths, 600, 30, "Nightmare master"),
                ("Void Lord", RegionID.AbyssalRift, 700, 35, "Void entity"),
                ("Convergence Core", RegionID.Convergence, 800, 40, "Elemental nexus")
            };
            foreach (var (n,r,h,d,desc) in B) {
                string p = dir+"/"+n.Replace(" ","_")+".asset";
                if (File.Exists(p)) continue;
                var data = ScriptableObject.CreateInstance<EnemyData>();
                data.displayName = n; data.maxHealth = h; data.attackDamage = d;
                data.xpReward = h; data.goldDropMin = h/4; data.goldDropMax = h/2;
                data.behaviorType = EnemyBehavior.Boss; data.regionID = r;
                AssetDatabase.CreateAsset(data, p); count++;
            }
            Debug.Log($"Generated {count} boss assets");
        }

        static void GenerateItems() {
            string dir = EnsureFolder("Assets/Data/Items/NewRegions");
            int count = 0;
            var items = new (string n, ItemType t, int v, string d)[] {
                ("Tidal Trident",ItemType.Weapon,45,"Ocean trident"), ("Coral Shield",ItemType.Armor,35,"Living coral"),
                ("Frostbite Blade",ItemType.Weapon,50,"Freezing sword"), ("Glacial Plate",ItemType.Armor,40,"Eternal ice"),
                ("Dream Shroud",ItemType.Armor,45,"Reality cloak"), ("Nightmare Dagger",ItemType.Weapon,40,"Fear blade"),
                ("Void Reaper",ItemType.Weapon,55,"Dimension scythe"), ("Null Plate",ItemType.Armor,50,"Void armor"),
                ("Prism Blade",ItemType.Weapon,60,"Element shifter"), ("Convergence Mantle",ItemType.Armor,55,"All resist"),
                ("Pearl of Sight",ItemType.Accessory,25,"Hidden paths"), ("Amulet of Warmth",ItemType.Accessory,20,"Cold resist"),
                ("Phantom Ring",ItemType.Accessory,30,"Phase shift"), ("Rift Walker Boots",ItemType.Accessory,35,"Phase walk"),
                ("Elemental Core",ItemType.Accessory,40,"All element boost"),
                ("Oxygen Pearl",ItemType.Consumable,15,"Restore oxygen"), ("Frost Elixir",ItemType.Consumable,18,"Cure freeze"),
                ("Dream Essence",ItemType.Consumable,20,"Purge nightmare"), ("Void Elixir",ItemType.Consumable,25,"Cure void"),
                ("Unity Elixir",ItemType.Consumable,30,"Cure all")
            };
            foreach (var (n,t,v,d) in items) {
                string safe = n.Replace(" ","_");
                string p = dir+"/"+safe+".asset";
                if (File.Exists(p)) continue;
                var data = ScriptableObject.CreateInstance<ItemData>();
                data.itemID = safe.ToLower(); data.displayName = n; data.itemType = t; data.value = v; data.description = d;
                AssetDatabase.CreateAsset(data, p); count++;
            }
            Debug.Log($"Generated {count} item assets");
        }

        static void GenerateQuests() {
            string dir = EnsureFolder("Assets/Data/Quests/NewRegions");
            int count = 0;
            var Q = new (string id, string n, RegionID r, QuestType t, string d)[] {
                ("q_sc_01","Tidal Threat",RegionID.SunkenCity,QuestType.Main,"Defeat Tidal Guardian"),
                ("q_sc_02","Herbalist Request",RegionID.SunkenCity,QuestType.Side,"Collect 5 herbs"),
                ("q_fr_01","Frosts End",RegionID.Frosthollow,QuestType.Main,"Defeat Storm Wyrm"),
                ("q_fr_02","Ice Fisher",RegionID.Frosthollow,QuestType.Side,"Catch 3 fish"),
                ("q_nd_01","Dream Collapse",RegionID.NightmareDepths,QuestType.Main,"Defeat Dreamweaver"),
                ("q_nd_02","Lucid Dreamer",RegionID.NightmareDepths,QuestType.Side,"Survive 5 waves"),
                ("q_ar_01","Void Seal",RegionID.AbyssalRift,QuestType.Main,"Defeat Void Lord"),
                ("q_ar_02","Rift Walker",RegionID.AbyssalRift,QuestType.Side,"Close 3 portals"),
                ("q_cv_01","Final Convergence",RegionID.Convergence,QuestType.Main,"Defeat Core"),
                ("q_cv_02","The Creator",RegionID.Convergence,QuestType.Main,"Final boss"),
                ("q_cv_03","Elemental Mastery",RegionID.Convergence,QuestType.Side,"Trigger 4 shifts"),
                ("q_cv_04","Perfect Run",RegionID.Convergence,QuestType.Side,"No damage clear")
            };
            foreach (var (id,n,r,t,d) in Q) {
                string p = dir+"/"+id+".asset";
                if (File.Exists(p)) continue;
                var data = ScriptableObject.CreateInstance<QuestData>();
                data.questID = id; data.questName = n; data.region = r; data.questType = t; data.description = d;
                data.objectiveType = t==QuestType.Main ? QuestObjectiveType.Kill : QuestObjectiveType.Collect;
                AssetDatabase.CreateAsset(data, p); count++;
            }
            Debug.Log($"Generated {count} quest assets");
        }
    }
}
