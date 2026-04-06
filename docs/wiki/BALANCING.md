# ⚖️ BALANCING — Баланс ACID KHUTIR

## Формули

### HP ворога
```javascript
enemyHP(wave) = 100 * Math.pow(1.18, wave - 1)
```
| Хвиля | HP |
|---|---|
| 1 | 100 |
| 3 | 139 |
| 5 | 194 |
| 7 | 270 |
| 10 | 444 |
| 11 (Boss) | 15000 |

### Шкода вежі
```javascript
towerDamage(baseDamage, level) = baseDamage * (1 + 0.35 * Math.log2(level + 1))
```

### Швидкість ворога
```javascript
speed = baseSpeed + wave * 2
```

### Золото
```javascript
// Базово
goldReward = 100

// Масштабоване
goldReward(wave) = 100 * (1 + wave * 0.05)

// Пасивний дохід
passiveIncome = 20 gold / 2 seconds (базово)
passiveIncome * 2 з перком Золотий Талон
```

## Вежі
| Тип | Шкода | Fire Rate | Range | Ціна |
|---|---|---|---|---|
| Goose | 30 | 1000ms | 220 | 50g |
| SuperHero | 150 | 2500ms | 280 | 150g |
| GoldenGoose | 0 | — | — | 100g |

## Апгрейди хати
| Рівень | HP | Ціна |
|---|---|---|
| 1 | 2000 | базово |
| 2 | 5000 | 200g |
| 3 | 12000 | 500g |

## Хвилі
| Хвиля | Кількість | HP Mod | Speed Mod | Event |
|---|---|---|---|---|
| 1 | 5 | ×1.00 | ×1.0 | Start |
| 5 | 13 | ×1.94 | ×1.4 | Perk Select |
| 10 | 25 | ×4.44 | ×1.9 | Perk Select |
| 11 | 1 | ×150 | ×0.6 | **BOSS** |
