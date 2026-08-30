using UnityEngine;
using UnityEditor;

/// <summary>
/// Editor script to generate all boss pattern data assets from the GDD.
/// Run via menu: Emberroot > Generate Boss Data
/// </summary>
public static class BossDataGenerator
{
    [MenuItem("Emberroot/Generate Boss Data")]
    public static void GenerateAllBossData()
    {
        CreateGoblinChieftain();
        CreateOverseer();
        CreateEmberLord();
        CreateTidalGuardian();
        CreateStormWyrm();
        CreateShadowKing();
        CreateVoidLord();
        CreateStatusEffects();
        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();
        Debug.Log("[BossDataGenerator] All 7 bosses + status effects generated!");
    }

    static void EnsureFolder(string path)
    {
        if (!AssetDatabase.IsValidFolder(path))
        {
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

    // === STATUS EFFECTS ===

    static void CreateStatusEffects()
    {
        EnsureFolder("Assets/Resources/Data/StatusEffects");

        CreateStatusEffect("burn", "Burn", Emberroot.StatusEffectType.Burn, 3f, 1f, 3,
            new Color(1f, 0.5f, 0f));
        CreateStatusEffect("slow", "Slow", Emberroot.StatusEffectType.Slow, 3f, 0, 0,
            new Color(0.5f, 0.7f, 1f), speedMult: 0.5f);
        CreateStatusEffect("stun", "Stun", Emberroot.StatusEffectType.Stun, 2f, 0, 0,
            Color.yellow, stunDur: 2f);
        CreateStatusEffect("poison", "Poison", Emberroot.StatusEffectType.Poison, 5f, 1.5f, 2,
            new Color(0.3f, 0.8f, 0.3f));
        CreateStatusEffect("freeze", "Freeze", Emberroot.StatusEffectType.Freeze, 2.5f, 0, 0,
            new Color(0.7f, 0.9f, 1f), speedMult: 0.3f, stunDur: 1.5f);
        CreateStatusEffect("curse", "Curse", Emberroot.StatusEffectType.Curse, 4f, 1f, 4,
            new Color(0.5f, 0f, 0.5f));
        CreateStatusEffect("shock", "Shock", Emberroot.StatusEffectType.Shock, 1.5f, 0.5f, 5,
            new Color(1f, 1f, 0.3f));

        Debug.Log("[BossDataGenerator] 7 status effects created");
    }

    static void CreateStatusEffect(string id, string name, Emberroot.StatusEffectType type,
        float duration, float tickInterval, int dmgPerTick, Color tintColor,
        float speedMult = 0.5f, float stunDur = 0f)
    {
        var fx = ScriptableObject.CreateInstance<Emberroot.StatusEffectData>();
        fx.effectID = id;
        fx.displayName = name;
        fx.effectType = type;
        fx.duration = duration;
        fx.tickInterval = tickInterval;
        fx.damagePerTick = dmgPerTick;
        fx.tintColor = tintColor;
        fx.speedMultiplier = speedMult;
        fx.stunDuration = stunDur;

        AssetDatabase.CreateAsset(fx, $"Assets/Resources/Data/StatusEffects/StatusEffect_{name}.asset");
    }

    // === BOSS 1: GOBLIN CHIEFTAIN (Forest) ===

    static void CreateGoblinChieftain()
    {
        EnsureFolder("Assets/Resources/Data/BossPatterns");

        var boss = ScriptableObject.CreateInstance<Emberroot.BossPatternData>();
        boss.bossID = "goblin_chieftain";
        boss.displayName = "Goblin Chieftain";

        boss.phase1Attacks = new Emberroot.BossAttack[]
        {
            new Emberroot.BossAttack { attackName = "Charge", attackType = Emberroot.BossAttackType.Charge,
                damage = 15f, range = 1.5f, telegraphDuration = 0.6f, executionDuration = 0.5f, cooldown = 3f },
            new Emberroot.BossAttack { attackName = "Spawn Goblin Minions", attackType = Emberroot.BossAttackType.SummonMinions,
                damage = 0f, hitCount = 3, telegraphDuration = 0.8f, executionDuration = 0.5f, cooldown = 5f }
        };
        boss.phase1Cooldown = 2.5f;

        boss.phase2Attacks = new Emberroot.BossAttack[]
        {
            new Emberroot.BossAttack { attackName = "Frenzy Swipe", attackType = Emberroot.BossAttackType.ComboAttack,
                damage = 18f, range = 1.8f, telegraphDuration = 0.3f, executionDuration = 0.2f, cooldown = 2f, hitCount = 3 },
            new Emberroot.BossAttack { attackName = "Ground Slam", attackType = Emberroot.BossAttackType.GroundSlam,
                damage = 25f, telegraphDuration = 0.7f, executionDuration = 0.3f, cooldown = 4f, isAoE = true, aoeRadius = 3f }
        };
        boss.phase2Cooldown = 1.5f;
        boss.phase2Enraged = true;

        boss.phase3Attacks = new Emberroot.BossAttack[]
        {
            new Emberroot.BossAttack { attackName = "Desperation Spawn", attackType = Emberroot.BossAttackType.SummonMinions,
                damage = 0f, hitCount = 5, telegraphDuration = 0.5f, executionDuration = 0.5f, cooldown = 4f },
            new Emberroot.BossAttack { attackName = "Enraged Charge", attackType = Emberroot.BossAttackType.DashAttack,
                damage = 30f, range = 2f, telegraphDuration = 0.2f, executionDuration = 0.3f, cooldown = 1.5f },
            new Emberroot.BossAttack { attackName = "Enraged Slam", attackType = Emberroot.BossAttackType.GroundSlam,
                damage = 35f, telegraphDuration = 0.4f, executionDuration = 0.2f, cooldown = 2f, isAoE = true, aoeRadius = 4f }
        };
        boss.phase3Cooldown = 1f;
        boss.phase3Enraged = true;
        boss.phase3MinionCount = 5;
        boss.arenaRadius = 8f;

        AssetDatabase.CreateAsset(boss, "Assets/Resources/Data/BossPatterns/Boss_GoblinChieftain.asset");
    }

    // === BOSS 2: THE OVERSEER (Mines) ===

    static void CreateOverseer()
    {
        var boss = ScriptableObject.CreateInstance<Emberroot.BossPatternData>();
        boss.bossID = "overseer";
        boss.displayName = "The Overseer";

        boss.phase1Attacks = new Emberroot.BossAttack[]
        {
            new Emberroot.BossAttack { attackName = "Crystal Shot", attackType = Emberroot.BossAttackType.ProjectileBurst,
                damage = 12f, range = 10f, telegraphDuration = 0.6f, executionDuration = 0.3f, cooldown = 2f,
                isProjectile = true, projectileSpeed = 8f, projectileCount = 3, projectileSpread = 20f },
            new Emberroot.BossAttack { attackName = "Crystal Barrier", attackType = Emberroot.BossAttackType.AoEBlast,
                damage = 10f, telegraphDuration = 0.8f, executionDuration = 0.5f, cooldown = 4f, isAoE = true, aoeRadius = 2f }
        };
        boss.phase1Cooldown = 2f;

        boss.phase2Attacks = new Emberroot.BossAttack[]
        {
            new Emberroot.BossAttack { attackName = "Laser Sweep", attackType = Emberroot.BossAttackType.ProjectileBurst,
                damage = 20f, range = 12f, telegraphDuration = 0.4f, executionDuration = 0.8f, cooldown = 3f,
                isProjectile = true, projectileCount = 7, projectileSpread = 120f, projectileSpeed = 10f },
            new Emberroot.BossAttack { attackName = "Crystal Spike Rain", attackType = Emberroot.BossAttackType.ProjectileBurst,
                damage = 15f, range = 8f, telegraphDuration = 1f, executionDuration = 0.2f, cooldown = 5f,
                isProjectile = true, projectileCount = 5, projectileSpread = 90f, projectileSpeed = 6f },
            new Emberroot.BossAttack { attackName = "Crystal Slam", attackType = Emberroot.BossAttackType.GroundSlam,
                damage = 28f, telegraphDuration = 0.6f, executionDuration = 0.3f, cooldown = 4f, isAoE = true, aoeRadius = 3.5f }
        };
        boss.phase2Cooldown = 1.5f;
        boss.phase2Enraged = true;

        boss.phase3Attacks = new Emberroot.BossAttack[]
        {
            new Emberroot.BossAttack { attackName = "Shard Storm", attackType = Emberroot.BossAttackType.ProjectileBurst,
                damage = 18f, range = 12f, telegraphDuration = 0.3f, executionDuration = 0.1f, cooldown = 1.5f,
                isProjectile = true, projectileCount = 8, projectileSpread = 360f, projectileSpeed = 9f },
            new Emberroot.BossAttack { attackName = "Crystal Nova", attackType = Emberroot.BossAttackType.AoEBlast,
                damage = 35f, telegraphDuration = 0.5f, executionDuration = 0.4f, cooldown = 5f, isAoE = true, aoeRadius = 5f },
            new Emberroot.BossAttack { attackName = "Crystalline Charge", attackType = Emberroot.BossAttackType.DashAttack,
                damage = 25f, range = 2f, telegraphDuration = 0.2f, executionDuration = 0.3f, cooldown = 2f }
        };
        boss.phase3Cooldown = 1f;
        boss.phase3Enraged = true;
        boss.arenaRadius = 10f;

        AssetDatabase.CreateAsset(boss, "Assets/Resources/Data/BossPatterns/Boss_Overseer.asset");
    }

    // === BOSS 3: EMBER LORD (Peak) ===

    static void CreateEmberLord()
    {
        var boss = ScriptableObject.CreateInstance<Emberroot.BossPatternData>();
        boss.bossID = "ember_lord";
        boss.displayName = "The Ember Lord";

        boss.phase1Attacks = new Emberroot.BossAttack[]
        {
            new Emberroot.BossAttack { attackName = "Fire Breath", attackType = Emberroot.BossAttackType.ProjectileBurst,
                damage = 14f, range = 8f, telegraphDuration = 0.5f, executionDuration = 0.1f, cooldown = 2f,
                isProjectile = true, projectileCount = 5, projectileSpread = 45f, projectileSpeed = 12f },
            new Emberroot.BossAttack { attackName = "Flame Pillar", attackType = Emberroot.BossAttackType.AoEBlast,
                damage = 22f, telegraphDuration = 1f, executionDuration = 0.5f, cooldown = 4f, isAoE = true, aoeRadius = 2.5f }
        };
        boss.phase1Cooldown = 2f;

        boss.phase2Attacks = new Emberroot.BossAttack[]
        {
            new Emberroot.BossAttack { attackName = "Eruption", attackType = Emberroot.BossAttackType.GroundSlam,
                damage = 30f, telegraphDuration = 0.8f, executionDuration = 0.4f, cooldown = 3.5f, isAoE = true, aoeRadius = 4f },
            new Emberroot.BossAttack { attackName = "Ember Wave", attackType = Emberroot.BossAttackType.ProjectileBurst,
                damage = 18f, range = 10f, telegraphDuration = 0.3f, executionDuration = 0.15f, cooldown = 2.5f,
                isProjectile = true, projectileCount = 12, projectileSpread = 180f, projectileSpeed = 8f },
            new Emberroot.BossAttack { attackName = "Magma Charge", attackType = Emberroot.BossAttackType.Charge,
                damage = 25f, range = 1.5f, telegraphDuration = 0.5f, executionDuration = 0.4f, cooldown = 3f }
        };
        boss.phase2Cooldown = 1.5f;
        boss.phase2Enraged = true;

        boss.phase3Attacks = new Emberroot.BossAttack[]
        {
            new Emberroot.BossAttack { attackName = "Inferno Blast", attackType = Emberroot.BossAttackType.AoEBlast,
                damage = 40f, telegraphDuration = 0.4f, executionDuration = 0.5f, cooldown = 4f, isAoE = true, aoeRadius = 6f },
            new Emberroot.BossAttack { attackName = "Hellfire Barrage", attackType = Emberroot.BossAttackType.ProjectileBurst,
                damage = 20f, range = 12f, telegraphDuration = 0.2f, executionDuration = 0.1f, cooldown = 1f,
                isProjectile = true, projectileCount = 16, projectileSpread = 360f, projectileSpeed = 10f },
            new Emberroot.BossAttack { attackName = "Final Eruption", attackType = Emberroot.BossAttackType.GroundSlam,
                damage = 50f, telegraphDuration = 1.5f, executionDuration = 0.6f, cooldown = 6f, isAoE = true, aoeRadius = 8f }
        };
        boss.phase3Cooldown = 1f;
        boss.phase3Enraged = true;
        boss.arenaRadius = 12f;

        AssetDatabase.CreateAsset(boss, "Assets/Resources/Data/BossPatterns/Boss_EmberLord.asset");
    }

    // === BOSS 4: TIDAL GUARDIAN (Swamp) ===

    static void CreateTidalGuardian()
    {
        var boss = ScriptableObject.CreateInstance<Emberroot.BossPatternData>();
        boss.bossID = "tidal_guardian";
        boss.displayName = "Tidal Guardian";

        boss.phase1Attacks = new Emberroot.BossAttack[]
        {
            new Emberroot.BossAttack { attackName = "Tidal Slam", attackType = Emberroot.BossAttackType.GroundSlam,
                damage = 18f, telegraphDuration = 0.6f, executionDuration = 0.4f, cooldown = 3f, isAoE = true, aoeRadius = 3f },
            new Emberroot.BossAttack { attackName = "Venom Spit", attackType = Emberroot.BossAttackType.ProjectileBurst,
                damage = 10f, range = 8f, telegraphDuration = 0.5f, executionDuration = 0.3f, cooldown = 2.5f,
                isProjectile = true, projectileCount = 3, projectileSpread = 30f, projectileSpeed = 7f }
        };
        boss.phase1Cooldown = 2.5f;

        boss.phase2Attacks = new Emberroot.BossAttack[]
        {
            new Emberroot.BossAttack { attackName = "Tidal Wave", attackType = Emberroot.BossAttackType.TidalWave,
                damage = 25f, range = 10f, telegraphDuration = 0.8f, executionDuration = 0.6f, cooldown = 4f,
                isAoE = true, aoeRadius = 8f },
            new Emberroot.BossAttack { attackName = "Swamp Summon", attackType = Emberroot.BossAttackType.SummonMinions,
                damage = 0f, hitCount = 4, telegraphDuration = 1f, executionDuration = 0.5f, cooldown = 5f },
            new Emberroot.BossAttack { attackName = "Tentacle Grab", attackType = Emberroot.BossAttackType.ComboAttack,
                damage = 15f, range = 4f, telegraphDuration = 0.4f, executionDuration = 0.3f, cooldown = 3f, hitCount = 3 }
        };
        boss.phase2Cooldown = 2f;
        boss.phase2Enraged = true;

        boss.phase3Attacks = new Emberroot.BossAttack[]
        {
            new Emberroot.BossAttack { attackName = "Abyssal Torrent", attackType = Emberroot.BossAttackType.TidalWave,
                damage = 35f, range = 12f, telegraphDuration = 0.5f, executionDuration = 0.8f, cooldown = 3f,
                isAoE = true, aoeRadius = 10f },
            new Emberroot.BossAttack { attackName = "Poison Nova", attackType = Emberroot.BossAttackType.AoEBlast,
                damage = 20f, telegraphDuration = 0.6f, executionDuration = 0.4f, cooldown = 4f, isAoE = true, aoeRadius = 6f },
            new Emberroot.BossAttack { attackName = "Heal", attackType = Emberroot.BossAttackType.Heal,
                damage = 0f, telegraphDuration = 1f, executionDuration = 0.5f, cooldown = 8f }
        };
        boss.phase3Cooldown = 2f;
        boss.phase3Enraged = true;
        boss.phase3MinionCount = 6;
        boss.arenaRadius = 10f;

        AssetDatabase.CreateAsset(boss, "Assets/Resources/Data/BossPatterns/Boss_TidalGuardian.asset");
    }

    // === BOSS 5: STORM WYRM (Skylands) ===

    static void CreateStormWyrm()
    {
        var boss = ScriptableObject.CreateInstance<Emberroot.BossPatternData>();
        boss.bossID = "storm_wyrm";
        boss.displayName = "Storm Wyrm";

        boss.phase1Attacks = new Emberroot.BossAttack[]
        {
            new Emberroot.BossAttack { attackName = "Lightning Breath", attackType = Emberroot.BossAttackType.ProjectileBurst,
                damage = 16f, range = 10f, telegraphDuration = 0.5f, executionDuration = 0.2f, cooldown = 2.5f,
                isProjectile = true, projectileCount = 4, projectileSpread = 25f, projectileSpeed = 14f },
            new Emberroot.BossAttack { attackName = "Wing Gust", attackType = Emberroot.BossAttackType.AoEBlast,
                damage = 12f, telegraphDuration = 0.6f, executionDuration = 0.4f, cooldown = 3.5f, isAoE = true, aoeRadius = 4f }
        };
        boss.phase1Cooldown = 2f;

        boss.phase2Attacks = new Emberroot.BossAttack[]
        {
            new Emberroot.BossAttack { attackName = "Storm Call", attackType = Emberroot.BossAttackType.StormCall,
                damage = 30f, telegraphDuration = 1.2f, executionDuration = 0.3f, cooldown = 5f, isAoE = true, aoeRadius = 5f },
            new Emberroot.BossAttack { attackName = "Dive Bomb", attackType = Emberroot.BossAttackType.DashAttack,
                damage = 22f, range = 2f, telegraphDuration = 0.3f, executionDuration = 0.2f, cooldown = 3f },
            new Emberroot.BossAttack { attackName = "Lightning Chain", attackType = Emberroot.BossAttackType.ProjectileBurst,
                damage = 18f, range = 12f, telegraphDuration = 0.4f, executionDuration = 0.15f, cooldown = 2f,
                isProjectile = true, projectileCount = 6, projectileSpread = 180f, projectileSpeed = 16f }
        };
        boss.phase2Cooldown = 1.5f;
        boss.phase2Enraged = true;

        boss.phase3Attacks = new Emberroot.BossAttack[]
        {
            new Emberroot.BossAttack { attackName = "Cataclysm", attackType = Emberroot.BossAttackType.StormCall,
                damage = 40f, telegraphDuration = 1f, executionDuration = 0.5f, cooldown = 4f, isAoE = true, aoeRadius = 8f },
            new Emberroot.BossAttack { attackName = "Typhoon", attackType = Emberroot.BossAttackType.AoEBlast,
                damage = 35f, telegraphDuration = 0.8f, executionDuration = 0.6f, cooldown = 5f, isAoE = true, aoeRadius = 7f },
            new Emberroot.BossAttack { attackName = "Enraged Dive", attackType = Emberroot.BossAttackType.DashAttack,
                damage = 45f, range = 2.5f, telegraphDuration = 0.2f, executionDuration = 0.15f, cooldown = 2f }
        };
        boss.phase3Cooldown = 1.5f;
        boss.phase3Enraged = true;
        boss.arenaRadius = 12f;

        AssetDatabase.CreateAsset(boss, "Assets/Resources/Data/BossPatterns/Boss_StormWyrm.asset");
    }

    // === BOSS 6: SHADOW KING (Shadow Realm) ===

    static void CreateShadowKing()
    {
        var boss = ScriptableObject.CreateInstance<Emberroot.BossPatternData>();
        boss.bossID = "shadow_king";
        boss.displayName = "The Shadow King";

        boss.phase1Attacks = new Emberroot.BossAttack[]
        {
            new Emberroot.BossAttack { attackName = "Shadow Bolt", attackType = Emberroot.BossAttackType.ProjectileBurst,
                damage = 18f, range = 10f, telegraphDuration = 0.4f, executionDuration = 0.2f, cooldown = 2f,
                isProjectile = true, projectileCount = 5, projectileSpread = 40f, projectileSpeed = 12f },
            new Emberroot.BossAttack { attackName = "Void Claw", attackType = Emberroot.BossAttackType.MeleeSwipe,
                damage = 22f, range = 2f, telegraphDuration = 0.3f, executionDuration = 0.2f, cooldown = 2.5f }
        };
        boss.phase1Cooldown = 2f;

        boss.phase2Attacks = new Emberroot.BossAttack[]
        {
            new Emberroot.BossAttack { attackName = "Shadow Clone", attackType = Emberroot.BossAttackType.ShadowClone,
                damage = 0f, hitCount = 2, telegraphDuration = 0.8f, executionDuration = 0.5f, cooldown = 6f },
            new Emberroot.BossAttack { attackName = "Void Rift", attackType = Emberroot.BossAttackType.VoidRift,
                damage = 28f, range = 8f, telegraphDuration = 0.6f, executionDuration = 0.4f, cooldown = 4f,
                isAoE = true, aoeRadius = 4f },
            new Emberroot.BossAttack { attackName = "Soul Drain", attackType = Emberroot.BossAttackType.ComboAttack,
                damage = 15f, range = 3f, telegraphDuration = 0.3f, executionDuration = 0.2f, cooldown = 3f, hitCount = 4 }
        };
        boss.phase2Cooldown = 1.5f;
        boss.phase2Enraged = true;

        boss.phase3Attacks = new Emberroot.BossAttack[]
        {
            new Emberroot.BossAttack { attackName = "Eclipse", attackType = Emberroot.BossAttackType.VoidRift,
                damage = 40f, telegraphDuration = 0.5f, executionDuration = 0.6f, cooldown = 5f, isAoE = true, aoeRadius = 10f },
            new Emberroot.BossAttack { attackName = "Shadow Storm", attackType = Emberroot.BossAttackType.ProjectileBurst,
                damage = 22f, range = 12f, telegraphDuration = 0.3f, executionDuration = 0.1f, cooldown = 1.5f,
                isProjectile = true, projectileCount = 12, projectileSpread = 360f, projectileSpeed = 14f },
            new Emberroot.BossAttack { attackName = "Curse Nova", attackType = Emberroot.BossAttackType.AoEBlast,
                damage = 30f, telegraphDuration = 0.6f, executionDuration = 0.4f, cooldown = 4f, isAoE = true, aoeRadius = 6f },
            new Emberroot.BossAttack { attackName = "Heal", attackType = Emberroot.BossAttackType.Heal,
                damage = 0f, telegraphDuration = 1f, executionDuration = 0.5f, cooldown = 10f }
        };
        boss.phase3Cooldown = 1.5f;
        boss.phase3Enraged = true;
        boss.phase3MinionCount = 4;
        boss.arenaRadius = 12f;

        AssetDatabase.CreateAsset(boss, "Assets/Resources/Data/BossPatterns/Boss_ShadowKing.asset");
    }

    // === BOSS 7: VOID LORD (Final Boss - Shadow Realm) ===

    static void CreateVoidLord()
    {
        var boss = ScriptableObject.CreateInstance<Emberroot.BossPatternData>();
        boss.bossID = "void_lord";
        boss.displayName = "The Void Lord";

        boss.phase1Attacks = new Emberroot.BossAttack[]
        {
            new Emberroot.BossAttack { attackName = "Void Beam", attackType = Emberroot.BossAttackType.LaserSweep,
                damage = 20f, range = 15f, telegraphDuration = 0.5f, executionDuration = 1f, cooldown = 4f,
                isProjectile = true, projectileCount = 1, projectileSpeed = 20f },
            new Emberroot.BossAttack { attackName = "Reality Tear", attackType = Emberroot.BossAttackType.VoidRift,
                damage = 25f, range = 6f, telegraphDuration = 0.6f, executionDuration = 0.4f, cooldown = 3f,
                isAoE = true, aoeRadius = 4f },
            new Emberroot.BossAttack { attackName = "Void Swarm", attackType = Emberroot.BossAttackType.SummonMinions,
                damage = 0f, hitCount = 4, telegraphDuration = 0.8f, executionDuration = 0.5f, cooldown = 5f }
        };
        boss.phase1Cooldown = 2.5f;

        boss.phase2Attacks = new Emberroot.BossAttack[]
        {
            new Emberroot.BossAttack { attackName = "Oblivion Wave", attackType = Emberroot.BossAttackType.AoEBlast,
                damage = 35f, telegraphDuration = 0.6f, executionDuration = 0.8f, cooldown = 5f, isAoE = true, aoeRadius = 8f },
            new Emberroot.BossAttack { attackName = "Void Barrage", attackType = Emberroot.BossAttackType.ProjectileBurst,
                damage = 18f, range = 14f, telegraphDuration = 0.3f, executionDuration = 0.1f, cooldown = 2f,
                isProjectile = true, projectileCount = 10, projectileSpread = 360f, projectileSpeed = 16f },
            new Emberroot.BossAttack { attackName = "Dimension Shift", attackType = Emberroot.BossAttackType.ShadowClone,
                damage = 0f, hitCount = 3, telegraphDuration = 1f, executionDuration = 0.5f, cooldown = 7f },
            new Emberroot.BossAttack { attackName = "Void Strike", attackType = Emberroot.BossAttackType.DashAttack,
                damage = 30f, range = 2f, telegraphDuration = 0.2f, executionDuration = 0.2f, cooldown = 2.5f }
        };
        boss.phase2Cooldown = 2f;
        boss.phase2Enraged = true;

        boss.phase3Attacks = new Emberroot.BossAttack[]
        {
            new Emberroot.BossAttack { attackName = "UNMAKING", attackType = Emberroot.BossAttackType.VoidRift,
                damage = 50f, telegraphDuration = 0.4f, executionDuration = 1f, cooldown = 6f, isAoE = true, aoeRadius = 12f },
            new Emberroot.BossAttack { attackName = "Void Storm", attackType = Emberroot.BossAttackType.ProjectileBurst,
                damage = 25f, range = 15f, telegraphDuration = 0.2f, executionDuration = 0.1f, cooldown = 1.5f,
                isProjectile = true, projectileCount = 16, projectileSpread = 360f, projectileSpeed = 18f },
            new Emberroot.BossAttack { attackName = "Reality Collapse", attackType = Emberroot.BossAttackType.GroundSlam,
                damage = 60f, telegraphDuration = 1f, executionDuration = 0.8f, cooldown = 7f, isAoE = true, aoeRadius = 10f },
            new Emberroot.BossAttack { attackName = "Consume", attackType = Emberroot.BossAttackType.ComboAttack,
                damage = 15f, range = 3f, telegraphDuration = 0.3f, executionDuration = 0.15f, cooldown = 2f, hitCount = 8 },
            new Emberroot.BossAttack { attackName = "Heal", attackType = Emberroot.BossAttackType.Heal,
                damage = 0f, telegraphDuration = 1.2f, executionDuration = 0.5f, cooldown = 12f }
        };
        boss.phase3Cooldown = 1.5f;
        boss.phase3Enraged = true;
        boss.phase3MinionCount = 6;
        boss.arenaRadius = 14f;

        AssetDatabase.CreateAsset(boss, "Assets/Resources/Data/BossPatterns/Boss_VoidLord.asset");
    }
}
