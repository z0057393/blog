---
title: "C# vers Protobuf"
description: "Apprenez à mapper efficacement vos types C# vers Protobuf (proto3). Guide complet avec tableaux, exemples et bonnes pratiques pour un interop fiable."
keywords:
  [
    "C# vers Protobuf",
    "Proto3",
    "types C# Protobuf",
    "wrappers Protobuf",
    "interop C# Protobuf",
    "guide Protobuf proto3",
  ]
---

# 🧬 C# vers Protobuf (proto3) — Guide pratique

Ce guide explique comment mapper efficacement les types **C#** vers **Protobuf (proto3)**, avec des exemples concrets, des tableaux explicatifs et des pièges courants à éviter.

---

## 🧪 Types scalaires

Le tableau suivant présente la correspondance entre les types C#, les types Protobuf natifs et les _wrappers_ Protobuf utilisés pour gérer la nullabilité.

| Type C#    | Type Protobuf (proto3)      | Wrapper Protobuf (nullable)   |
| ---------- | --------------------------- | ----------------------------- |
| `int`      | `int32`                     | `google.protobuf.Int32Value`  |
| `long`     | `int64`                     | `google.protobuf.Int64Value`  |
| `uint`     | `uint32`                    | `google.protobuf.UInt32Value` |
| `ulong`    | `uint64`                    | `google.protobuf.UInt64Value` |
| `short`    | `int32`                     | `google.protobuf.Int32Value`  |
| `ushort`   | `uint32`                    | `google.protobuf.UInt32Value` |
| `byte`     | `uint32`                    | `google.protobuf.UInt32Value` |
| `sbyte`    | `int32`                     | `google.protobuf.Int32Value`  |
| `bool`     | `bool`                      | `google.protobuf.BoolValue`   |
| `float`    | `float`                     | `google.protobuf.FloatValue`  |
| `double`   | `double`                    | `google.protobuf.DoubleValue` |
| `decimal`  | `string`                    | `google.protobuf.StringValue` |
| `string`   | `string`                    | `google.protobuf.StringValue` |
| `byte[]`   | `bytes`                     | `google.protobuf.BytesValue`  |
| `DateTime` | `google.protobuf.Timestamp` | `google.protobuf.Timestamp`   |
| `TimeSpan` | `google.protobuf.Duration`  | `google.protobuf.Duration`    |
| `Guid`     | `string`                    | `google.protobuf.StringValue` |

---

### 🧩 Cas particulier : `decimal`

Le type `decimal` n’existe pas nativement en Protobuf.

**Solutions courantes :**

| Approche          | Description                  | Avantages           | Inconvénients    |
| ----------------- | ---------------------------- | ------------------- | ---------------- |
| `string`          | Stockage textuel             | Précision conservée | Parsing requis   |
| `int64` + facteur | Valeur multipliée (ex: ×100) | Performant          | Gestion manuelle |
| Message dédié     | `units` + `nanos`            | Très précis         | Plus complexe    |

📝 **Astuce** : pour les montants financiers, préférez un `int64` avec facteur d’échelle documenté.

---

## 🧱 Types complexes

Correspondance entre structures C# et structures Protobuf.

| C#                 | Protobuf         | Remarques              |
| ------------------ | ---------------- | ---------------------- |
| `enum`             | `enum`           | Valeurs entières       |
| `class` / `record` | `message`        | DTO / contrats         |
| `List<T>`          | `repeated T`     | Ordre conservé         |
| `T[]`              | `repeated T`     | Équivalent             |
| `Dictionary<K,V>`  | `map<K,V>`       | K limité aux scalaires |
| `Nullable<T>`      | Wrapper Protobuf | Requis en proto3       |

---

## 🛠️ Exemples de définitions

### 📄 Classe C#

```csharp
public record User(
    Guid Id,
    string Name,
    int? Age,
    DateTime CreatedAt
);
```

### 📦 Message Protobuf

```proto
syntax = "proto3";

import "google/protobuf/wrappers.proto";
import "google/protobuf/timestamp.proto";

message User {
  string id = 1;
  string name = 2;
  google.protobuf.Int32Value age = 3;
  google.protobuf.Timestamp created_at = 4;
}
```

ℹ️ **Note** : Les champs sont numérotés une seule fois et ne doivent jamais être réutilisés.

---

## 🔗 Imports nécessaires

Ces imports sont requis selon les types utilisés.

```proto
import "google/protobuf/wrappers.proto";
import "google/protobuf/timestamp.proto";
import "google/protobuf/duration.proto";
```

---

## 🧯 Problèmes fréquents / Causes probables

| Problème                 | Cause probable                  | Solution                    |
| ------------------------ | ------------------------------- | --------------------------- |
| Champ toujours à 0       | Type scalaire non nullable      | Utiliser un wrapper         |
| Date incorrecte          | Fuseau horaire ignoré           | Toujours utiliser UTC       |
| Valeur décimale tronquée | Conversion `decimal` → `double` | Éviter `double`             |
| Map invalide             | Clé non scalaire                | Utiliser `string` ou `int`  |
| Champ supprimé           | Numéro réutilisé                | Ne jamais réutiliser un tag |
