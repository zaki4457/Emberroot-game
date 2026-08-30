using UnityEngine;
using UnityEditor;
using UnityEngine.SceneManagement;
using UnityEditor.SceneManagement;

/// <summary>
/// One-click project setup. Run via menu: Emberroot > Setup Project.
/// Creates managers hierarchy, player prefab, layers, tags, and default scene.
/// Updated to include all 84-script expansion systems.
/// </summary>
public static class ProjectSetup
{
    [MenuItem("Emberroot/Setup Project")]
    public static void SetupProject()
    {
        SetupLayersAndTags();
        SetupTags();
        CreateManagersHierarchy();
        CreatePlayerPrefab();
        CreateEnemyPrefab();
        CreateNPCPrefab();
        CreateProjectilePrefab();
        CreateCheckpointPrefab();
        CreateDamageNumberPrefab();
        CreateDefaultScene();
        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();
        Debug.Log("[ProjectSetup] Project setup complete! All scripts configured.");
    }

    [MenuItem("Emberroot/Setup Layers & Tags")]
    public static void SetupLayersAndTags()
    {
        // Layers: 6=Player, 7=Enemy, 8=NPC, 9=Projectile, 10=Ground
        SetLayer(6, "Player");
        SetLayer(7, "Enemy");
        SetLayer(8, "NPC");
        SetLayer(9, "Projectile");
        SetLayer(10, "Ground");
        Debug.Log("[ProjectSetup] Layers configured");
    }

    [MenuItem("Emberroot/Setup Tags")]
    public static void SetupTags()
    {
        SerializedObject tagManager = new SerializedObject(AssetDatabase.LoadAllAssetsAtPath("ProjectSettings/TagManager.asset")[0]);
        SerializedProperty tags = tagManager.FindProperty("tags");

        string[] requiredTags = { "Checkpoint", "RegionTransition", "FastTravel", "Boss" };
        foreach (string tag in requiredTags)
        {
            bool found = false;
            for (int i = 0; i < tags.arraySize; i++)
            {
                if (tags.GetArrayElementAtIndex(i).stringValue == tag) { found = true; break; }
            }
            if (!found)
            {
                tags.InsertArrayElementAtIndex(tags.arraySize);
                tags.GetArrayElementAtIndex(tags.arraySize - 1).stringValue = tag;
            }
        }
        tagManager.ApplyModifiedProperties();
        Debug.Log("[ProjectSetup] Tags configured");
    }

    private static void SetLayer(int index, string name)
    {
        SerializedObject tagManager = new SerializedObject(AssetDatabase.LoadAllAssetsAtPath("ProjectSettings/TagManager.asset")[0]);
        SerializedProperty layers = tagManager.FindProperty("layers");
        if (index < layers.arraySize)
        {
            SerializedProperty layer = layers.GetArrayElementAtIndex(index);
            if (string.IsNullOrEmpty(layer.stringValue))
            {
                layer.stringValue = name;
                tagManager.ApplyModifiedProperties();
            }
        }
    }

    [MenuItem("Emberroot/Create Managers Hierarchy")]
    public static void CreateManagersHierarchy()
    {
        var root = GameObject.Find("__Managers__");
        if (root == null) root = new GameObject("__Managers__");

        // === Core Systems ===
        AddManager<GameManager>(root, "GameManager");
        AddManager<AudioManager>(root, "AudioManager");
        AddManager<SaveSystem>(root, "SaveSystem");
        AddManager<DifficultyManager>(root, "DifficultyManager");
        AddManager<CheckpointManager>(root, "CheckpointManager");
        AddManager<StatsTracker>(root, "StatsTracker");
        AddManager<AchievementManager>(root, "AchievementManager");
        AddManager<TutorialManager>(root, "TutorialManager");
        AddManager<CutsceneManager>(root, "CutsceneManager");

        // === Hub Systems ===
        AddManager<VillageMemorySystem>(root, "VillageMemorySystem");
        AddManager<DialogueManager>(root, "DialogueManager");
        AddManager<QuestManager>(root, "QuestManager");
        AddManager<ReputationManager>(root, "ReputationManager");
        AddManager<HubManager>(root, "HubManager");

        // === Inventory & Skills ===
        AddManager<InventoryManager>(root, "InventoryManager");
        AddManager<EquipmentManager>(root, "EquipmentManager");
        AddManager<SkillTreeManager>(root, "SkillTreeManager");

        // === World Systems ===
        AddManager<FastTravelManager>(root, "FastTravelManager");
        AddManager<EnemySpawnManager>(root, "EnemySpawnManager");

        // === Crafting & Loot ===
        AddManager<CraftingManager>(root, "CraftingManager");
        AddManager<LootDropSystem>(root, "LootDropSystem");

        // === Utility ===
        AddManager<ObjectPool>(root, "ObjectPool");
        AddManager<ScreenShake>(root, "ScreenShake");
        AddManager<HitStop>(root, "HitStop");

        // === Expansion Systems (stubs — IsInstalled=false by default) ===
        AddManager<ContentManager>(root, "ContentManager");
        AddManager<CosmeticManager>(root, "CosmeticManager");
        AddManager<RunManager>(root, "RunManager");
        AddManager<ModLoader>(root, "ModLoader");
        AddManager<CoopNetworkManager>(root, "CoopNetworkManager");

        Debug.Log("[ProjectSetup] Managers hierarchy created — 25 managers total");
    }

    private static T AddManager<T>(GameObject parent, string name) where T : MonoBehaviour
    {
        var existing = parent.transform.Find(name);
        if (existing != null)
        {
            var comp = existing.GetComponent<T>();
            if (comp == null) comp = existing.gameObject.AddComponent<T>();
            return comp;
        }

        var go = new GameObject(name);
        go.transform.SetParent(parent.transform);
        return go.AddComponent<T>();
    }

    [MenuItem("Emberroot/Create Player Prefab")]
    public static void CreatePlayerPrefab()
    {
        var player = new GameObject("Player");
        player.tag = "Player";
        player.layer = 6;

        // Physics
        var rb = player.AddComponent<Rigidbody2D>();
        rb.gravityScale = 0;
        rb.freezeRotation = true;
        rb.collisionDetectionMode = CollisionDetectionMode2D.Continuous;

        var col = player.AddComponent<BoxCollider2D>();
        col.size = new Vector2(0.8f, 0.8f);

        // Renderer + Animator
        player.AddComponent<SpriteRenderer>();
        player.AddComponent<Animator>();

        // Input
        player.AddComponent<UnityEngine.InputSystem.PlayerInput>();

        // Core player components
        player.AddComponent<PlayerController>();
        player.AddComponent<PlayerHealth>();
        player.AddComponent<PlayerStamina>();
        player.AddComponent<PlayerCombat>();
        player.AddComponent<PlayerInventory>();
        player.AddComponent<PlayerLevelManager>();

        // Status effect receiver
        player.AddComponent<StatusEffectReceiver>();

        // Visual effects
        player.AddComponent<PlayerTrailEffect>();

        // Attack points
        var attackPoint = new GameObject("AttackPoint");
        attackPoint.transform.SetParent(player.transform);
        attackPoint.transform.localPosition = new Vector3(0.5f, 0, 0);

        var rangedPoint = new GameObject("RangedSpawnPoint");
        rangedPoint.transform.SetParent(player.transform);
        rangedPoint.transform.localPosition = new Vector3(0.3f, 0.1f, 0);

        // Save as prefab
        EnsureFolder("Assets/Prefabs");
        string prefabPath = "Assets/Prefabs/Player.prefab";
        PrefabUtility.SaveAsPrefabAsset(player, prefabPath);
        Object.DestroyImmediate(player);
        Debug.Log($"[ProjectSetup] Player prefab created at {prefabPath}");
    }

    [MenuItem("Emberroot/Create Enemy Prefab")]
    public static void CreateEnemyPrefab()
    {
        var enemy = new GameObject("Enemy");
        enemy.tag = "Enemy";
        enemy.layer = 7;

        var rb = enemy.AddComponent<Rigidbody2D>();
        rb.gravityScale = 0;
        rb.freezeRotation = true;

        var col = enemy.AddComponent<BoxCollider2D>();
        col.size = new Vector2(0.8f, 0.8f);

        enemy.AddComponent<SpriteRenderer>();
        enemy.AddComponent<Animator>();
        enemy.AddComponent<EnemyAI>();
        enemy.AddComponent<EnemyHealth>();

        // Status effect receiver
        enemy.AddComponent<StatusEffectReceiver>();

        // Patrol points container
        var patrolPoints = new GameObject("PatrolPoints");
        patrolPoints.transform.SetParent(enemy.transform);

        // Add a few default patrol points
        for (int i = 0; i < 3; i++)
        {
            var point = new GameObject($"Point_{i}");
            point.transform.SetParent(patrolPoints.transform);
            point.transform.localPosition = new Vector3(i * 2f - 2f, 0, 0);
        }

        EnsureFolder("Assets/Prefabs");
        string prefabPath = "Assets/Prefabs/Enemy.prefab";
        PrefabUtility.SaveAsPrefabAsset(enemy, prefabPath);
        Object.DestroyImmediate(enemy);
        Debug.Log($"[ProjectSetup] Enemy prefab created at {prefabPath}");
    }

    [MenuItem("Emberroot/Create NPC Prefab")]
    public static void CreateNPCPrefab()
    {
        var npc = new GameObject("NPC");
        npc.layer = 8;

        var rb = npc.AddComponent<Rigidbody2D>();
        rb.gravityScale = 0;
        rb.freezeRotation = true;

        var col = npc.AddComponent<BoxCollider2D>();
        col.size = new Vector2(0.6f, 0.6f);

        npc.AddComponent<SpriteRenderer>();
        npc.AddComponent<Animator>();

        // Dialogue trigger for interaction
        var triggerCol = npc.AddComponent<BoxCollider2D>();
        triggerCol.isTrigger = true;
        triggerCol.size = new Vector2(1.5f, 1.5f);

        npc.AddComponent<DialogueTrigger>();

        EnsureFolder("Assets/Prefabs");
        string prefabPath = "Assets/Prefabs/NPC.prefab";
        PrefabUtility.SaveAsPrefabAsset(npc, prefabPath);
        Object.DestroyImmediate(npc);
        Debug.Log($"[ProjectSetup] NPC prefab created at {prefabPath}");
    }

    [MenuItem("Emberroot/Create Projectile Prefab")]
    public static void CreateProjectilePrefab()
    {
        var projectile = new GameObject("Projectile");
        projectile.layer = 9;

        var rb = projectile.AddComponent<Rigidbody2D>();
        rb.gravityScale = 0;
        rb.freezeRotation = true;
        rb.isKinematic = true;

        var col = projectile.AddComponent<BoxCollider2D>();
        col.size = new Vector2(0.3f, 0.3f);
        col.isTrigger = true;

        projectile.AddComponent<SpriteRenderer>();
        projectile.AddComponent<Projectile>();

        EnsureFolder("Assets/Prefabs");
        string prefabPath = "Assets/Prefabs/Projectile.prefab";
        PrefabUtility.SaveAsPrefabAsset(projectile, prefabPath);
        Object.DestroyImmediate(projectile);
        Debug.Log($"[ProjectSetup] Projectile prefab created at {prefabPath}");
    }

    [MenuItem("Emberroot/Create Default Scene")]
    public static void CreateDefaultScene()
    {
        // Create new scene
        var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);

        // Delete default camera and light (we'll set up our own)
        var defaultCam = Camera.main;
        if (defaultCam != null) Object.DestroyImmediate(defaultCam.gameObject);

        // Create managers
        CreateManagersHierarchy();

        // Create camera
        var camObj = new GameObject("Main Camera");
        camObj.tag = "MainCamera";
        var cam = camObj.AddComponent<Camera>();
        cam.orthographic = true;
        cam.orthographicSize = 5f;
        camObj.AddComponent<AudioListener>();
        camObj.AddComponent<CameraFollow>();
        camObj.transform.position = new Vector3(0, 0, -10);

        // Create ground
        var ground = GameObject.CreatePrimitive(PrimitiveType.Quad);
        ground.name = "Ground";
        ground.transform.position = new Vector3(0, -3f, 0);
        ground.transform.localScale = new Vector3(20f, 0.5f, 1f);
        ground.layer = 10;
        var groundRenderer = ground.GetComponent<MeshRenderer>();
        if (groundRenderer != null)
        {
            var mat = new Material(Shader.Find("Sprites/Default"));
            mat.color = new Color(0.3f, 0.25f, 0.2f);
            groundRenderer.material = mat;
        }
        Object.DestroyImmediate(ground.GetComponent<BoxCollider>());

        // Create background color
        cam.backgroundColor = new Color(0.15f, 0.12f, 0.1f);

        // Save scene
        EnsureFolder("Assets/Scenes");
        EditorSceneManager.SaveScene(scene, "Assets/Scenes/MainScene.unity");
        Debug.Log("[ProjectSetup] Default scene created at Assets/Scenes/MainScene.unity");
    }

    [MenuItem("Emberroot/Create Checkpoint Prefab")]
    public static void CreateCheckpointPrefab()
    {
        var checkpoint = new GameObject("Checkpoint");
        checkpoint.tag = "Checkpoint";

        var col = checkpoint.AddComponent<BoxCollider2D>();
        col.isTrigger = true;
        col.size = new Vector2(2f, 2f);

        checkpoint.AddComponent<SpriteRenderer>();

        EnsureFolder("Assets/Prefabs");
        string prefabPath = "Assets/Prefabs/Checkpoint.prefab";
        PrefabUtility.SaveAsPrefabAsset(checkpoint, prefabPath);
        Object.DestroyImmediate(checkpoint);
        Debug.Log($"[ProjectSetup] Checkpoint prefab created at {prefabPath}");
    }

    [MenuItem("Emberroot/Create DamageNumber Prefab")]
    public static void CreateDamageNumberPrefab()
    {
        EnsureFolder("Assets/Prefabs");
        EnsureFolder("Assets/Resources/Prefabs");

        // Create a Canvas for the damage number
        var canvas = new GameObject("DamageNumberCanvas");
        var canvasComp = canvas.AddComponent<Canvas>();
        canvasComp.renderMode = RenderMode.WorldSpace;
        canvas.AddComponent<UnityEngine.UI.CanvasScaler>();
        canvas.AddComponent<UnityEngine.UI.GraphicRaycaster>();

        // Create text
        var textObj = new GameObject("DamageText");
        textObj.transform.SetParent(canvas.transform);
        var tmp = textObj.AddComponent<TMPro.TextMeshPro>();
        tmp.fontSize = 4;
        tmp.alignment = TMPro.TextAlignmentOptions.Center;
        tmp.color = Color.white;

        // Add DamageNumberPopup component to canvas
        canvas.AddComponent<Emberroot.DamageNumberPopup>();

        string prefabPath = "Assets/Resources/Prefabs/DamageNumberPopup.prefab";
        PrefabUtility.SaveAsPrefabAsset(canvas, prefabPath);
        Object.DestroyImmediate(canvas);
        Debug.Log($"[ProjectSetup] DamageNumber prefab created at {prefabPath}");
    }

    private static void EnsureFolder(string path)
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
